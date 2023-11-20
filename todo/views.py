import calendar
from django.db.models import Count
from datetime import date, datetime, timedelta
from itertools import chain
import time
from django.utils import timezone
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django import forms
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

import json
from django.contrib.auth import authenticate, login, logout
#from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from .models import User, Task

class NewTaskForm(forms.Form):
    task = forms.CharField(label="New Task")

# views.py
from django.http import JsonResponse

def counthabits(request):
    # Get the user's tasks and count the number of times each task has been completed
    completed_tasks = Task.objects.filter(user=request.user, completed=True) \
                                  .values('task') \
                                  .annotate(completions=Count('task')) \
                                  .order_by('-completions')[:5]

    # Convert the query result into a list of dictionaries
    top_completed_tasks = [{'task': task['task'], 'completions': task['completions']} for task in completed_tasks]
    print(f"top_completed_tasks: {top_completed_tasks}")
    # Return the top completed tasks as JSON
    return JsonResponse({'top_completed_tasks': top_completed_tasks})


def loadtasks(request, year, month, day):
    print("loadtasks called")
    try:
        # Parse the input date components (year, month, and day) and create a datetime object
        
        
        # Query the tasks that match the input date and order them by 'index'
        # test case all tasks
        all_tasks = Task.objects.all().order_by('index')
        # print("all tasks:", all_tasks)
        # print out all tasks
        #for task in all_tasks:
        #    print(task.date.strftime('%Y-%m-%d %H:%M:%S'))
        
        tasks_on_date = Task.objects.filter(date__year=year, date__month=month, date__day=day, user=request.user).order_by('index')
        # get tasks from yesterday where repeat is true
        yesterdays_repeat_tasks = Task.objects.filter(date__year=year, date__month=month, date__day=day-1, repeats = True, user=request.user).order_by('index')
        # print("tasks:", tasks_on_date)
        # print("repeat tasks: ", yesterdays_repeat_tasks)
        date_obj = datetime(year, month, day)
        new_carryover_tasks = []
        # Format the datetime object as a string
        formatted_date = date_obj.strftime('%Y-%m-%d %H:%M:%S')
        # create new tasks from yesterdays repeat tasks on today's date
        for task in yesterdays_repeat_tasks:
            #check and see if today already has a task matching this one
            currentTask = task.task
            if any(task.task == currentTask for task in tasks_on_date):
                print(f"repeat task already in tasks for today {task.task}")
                continue
            else:
                new_task = Task(task=task.task, user=task.user, repeats = task.repeats, index=0, date=formatted_date)
                new_carryover_tasks.append(currentTask)
                new_task.save()
        all_tasks = chain(tasks_on_date, new_carryover_tasks)
        # Serialize the tasks to JSON
        tasks_json = [{'id': task.id, 'task': task.task, 'date': task.date.strftime('%Y-%m-%d %H:%M:%S'), 'repeats': task.repeats, 'completed': task.completed, 'index': task.index} for task in all_tasks]
        # print (tasks_json)
        # tasks_json_string = json.dumps(tasks_json, indent=4)
        # print("json:", tasks_json_string)
        
        # Return the tasks as JSON response
        return JsonResponse({'tasks': tasks_json})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# Create your views here.
def index(request):
    if "tasks" not in request.session:
        request.session["tasks"] = []
    return render(request, 'todo/index.html', {
        "tasks": request.session["tasks"], 
        "form": NewTaskForm()
    })

def greet(request, name):
    return render(request, "todo/greet.html", {
        "name": name
    })

def monthlycompletions(request):
    # Get the current date in the user's time zone
    # Get the current date
    current_date = date.today()

    # Calculate the first day of the current month
    first_day_of_month = current_date.replace(day=1)

    # Calculate the last day of the current month
    _, last_day = calendar.monthrange(first_day_of_month.year, first_day_of_month.month)
    last_day_of_month = first_day_of_month.replace(day=last_day)

    # print(f"last day of the month: {last_day_of_month}")
    # Create a list to store completion percentages for each day
    completion_percentages = []

    # Loop through each day of the current month
    current_day = first_day_of_month
    while current_day <= last_day_of_month:
        # Calculate the next day
        next_day = current_day + timedelta(days=1)

        # Query tasks for the current day
        tasks_on_day = Task.objects.filter(
            date__gte=timezone.make_aware(datetime.combine(current_day, datetime.min.time())),
            date__lt=timezone.make_aware(datetime.combine(next_day, datetime.min.time())),
            user=request.user,
        )

        # Calculate the total number of tasks and completed tasks for the day
        total_tasks = tasks_on_day.count()
        completed_tasks = tasks_on_day.filter(completed=True).count()

        # Calculate the completion percentage for the day
        completion_percentage = (
            (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        )
        # print(f"day is {current_day} completion_percentage:{completion_percentage}");
        # Append the completion percentage to the list
        completion_percentages.append(
            {
                "date": current_day.strftime("%Y-%m-%d"),
                "completion_percentage": completion_percentage,
            }
        )

        # Move to the next day
        current_day = next_day

    # Return the completion percentages as JSON response
    return JsonResponse({"completion_percentages": completion_percentages})

def complete(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            task_id = data.get('task_id')
            task_complete = data.get('task_complete')
            
            # Retrieve the task from the database
            try:
                task = Task.objects.get(pk=task_id)
                
                # Update the task's variables with the provided values
                task.completed = task_complete
                
                # Save the updated task to the database
                task.save()
                
                # Return a success message
                return JsonResponse({'message': 'Task updated successfully'})
            
            except Task.DoesNotExist:
                # Handle the case where the task with the provided task_id does not exist
                return JsonResponse({'error': 'Task not found'}, status=404)
            
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    
    # Handle other potential exceptions
    return JsonResponse({'error': 'Invalid request'}, status=400)

def delete(request, taskID):
    print("delete called")
    if request.method == "POST":
        try:
            # Attempt to delete the task
            task = Task.objects.get(pk=taskID)
            task.delete()
            print(f"Task {taskID} deleted successfully")
            # Return a success JSON response
            return JsonResponse({"success": True})
        except Task.DoesNotExist:
            # Handle the case where the task doesn't exist
            return JsonResponse({"success": False, "error": "Task not found"}, status=404)
        except Exception as e:
            # Handle other potential errors (e.g., permission issues)
            return JsonResponse({"success": False, "error": str(e)}, status=500)
    else:
        # Handle GET requests or other HTTP methods
        return JsonResponse({"success": False, "error": "Only POST requests are allowed"}, status=405)

# assign ID only to to each taskdiv
# then based on that ID, update each element in the task card div
# then update the entire server by json once the user is done editing
# step through the children and assign index based on order
# if any are empty delete them

#recieves task json and then updates all tasks accordingly with "update" function

def updateAllTasks(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            
            # Check if 'taskUpdates' key exists in the JSON data
            if 'taskUpdates' in data:
                task_updates = data['taskUpdates']
                
                # Initialize a list to store response messages
                response_messages = []

                # Loop through each taskUpdateData
                for task_update_data in task_updates:
                    task_id = task_update_data.get('id', None)
                    task_text = task_update_data.get('task', None)
                    task_index = task_update_data.get('index', 0)

                    if task_id is not None and task_text is not None:
                        # Call the update_task function to update the task
                        response_message = update_task(task_id, task_text, task_index)
                        response_messages.append(response_message)
                    else:
                        response_messages.append("Invalid taskUpdateData format")

                # Return a JSON response with response messages
                return JsonResponse({'response_messages': response_messages})
            else:
                return JsonResponse({'error': 'Invalid JSON format: Missing "taskUpdates" key'}, status=400)
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt
def updateRepeat(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            task_id = data.get('task_id')
            task_repeats = data.get('task_repeats')
            
            # Retrieve the task from the database
            try:
                task = Task.objects.get(pk=task_id)
                
                # Update the task's variables with the provided values
                task.repeats = task_repeats
                
                # Save the updated task to the database
                task.save()
                
                # Return a success message
                return JsonResponse({'message': 'Task updated successfully'})
            
            except Task.DoesNotExist:
                # Handle the case where the task with the provided task_id does not exist
                return JsonResponse({'error': 'Task not found'}, status=404)
            
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    
    # Handle other potential exceptions
    return JsonResponse({'error': 'Invalid request'}, status=400)

def update_task(task_id, task_text, task_index):
    try:
        # Get the task with the given task_id
        task = Task.objects.get(pk=task_id)
        
        # Update the task's variables with the provided values
        task.task = task_text
        task.index = task_index
        
        # Save the updated task to the database
        task.save()
        
        # Return a success message or other response as needed
        return "Task updated successfully"
    
    except Task.DoesNotExist:
        # Handle the case where the task with the provided task_id does not exist
        return "Task not found"
    except Exception as e:
        # Handle other potential exceptions
        return f"Error: {str(e)}"

# Example usage:
# Call the function with the task_id and updated values
# update_task(task_id, task_text, task_repeats, task_index, task_completed)


def add(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            
            # Access and process the JSON data
            task_text = data.get('task')
            currentIndex = data.get('currentIndex')
            # Get the current local date and time
            current_datetime = timezone.localtime(timezone.now())
            # print("current_datetime:", current_datetime)
            # Assuming you have access to the current user, you can create a new Task object
            user = request.user  # Replace this with your actual user retrieval logic

            # Create a new Task object and save it to the database

            new_task = Task(task=task_text, user=user, index=currentIndex, date=current_datetime)
            new_task.save()

            # Create a response JSON
            response_data = {'response_message': 'JSON data received and processed successfully', 'new_task_id': new_task.id}
            return JsonResponse(response_data)

        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "todo/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "todo/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "todo/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "todo/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "todo/register.html")
