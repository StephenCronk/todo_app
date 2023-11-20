from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    #path("<str:name>", views.greet, name="greet"), 
    path("add", views.add, name="add"),
    path("delete/<int:taskID>/", views.delete, name="delete"),
    path('loadtasks/<int:year>/<int:month>/<int:day>/', views.loadtasks, name='loadtasks'),
    path('update-all-tasks', views.updateAllTasks, name='updateAllTasks'),
    path('update-repeat', views.updateRepeat, name='updateRepeat'),
    path('complete', views.complete, name="complete"),
    path('monthlycompletions', views.monthlycompletions, name="monthlycompletions"),
    path('counthabits', views.counthabits, name="counthabits"),

    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]