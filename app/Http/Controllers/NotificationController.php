<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Resources\NotificationResource;
use App\Notifications\OrderPlacedNotification;



class NotificationController extends Controller
{
    //
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->paginate(3);

        return inertia('user/profile/notifications', [
            'data' => NotificationResource::collection($notifications)
        ]);
    }

    // Mark a specific one as read
    public function update(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back(); // Refresh the list and the Navbar count
    }

    // Mark all as read
    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'All notifications marked as read');
    }

    //delete
    public function destroy(Request $request, $id)
    {
        // Ensure the notification belongs to the authenticated user
        $notification = $request->user()->notifications()->findOrFail($id);
        
        $notification->delete();

        // Redirect back to the notifications list
        // Inertia will automatically refresh the 'notifications' and 'unread_count' props
        return back();
    }

    public function destroyAll(Request $request)
    {
        // Delete every notification for the authenticated user
        $request->user()->notifications()->delete();

        return back();
    }


    //test send notif to user
    public function test(Request $request)
    {
        $user = $request->user();
        $user->notify(new OrderPlacedNotification ('/profile/orders'));
        return back();
    }


   
}
