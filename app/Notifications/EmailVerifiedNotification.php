<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Broadcasting\PrivateChannel;

use Illuminate\Notifications\Notification;
use App\Mail\EmailVerifiedMailable; // Import the Mailable
use App\Models\User;


class EmailVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $url;

    /**
     * Create a new notification instance.
     */
    public function __construct($url)
    {
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function broadcastOn(): array
    {
        // The $this->notifiable is the recipient of the notification (the User model).
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('')
            ->view('emails.email_verified', [
                'user' => $notifiable, // $notifiable is the User model
                'url' => $this->url,
            ]);
    }


    

    public function toBroadcast(object $notifiable): array
    {
        // $unreadCount = $notifiable->unreadNotifications()->count();
        // return [
        //     'unread_count' => $unreadCount,
        // ];
    }

    /**
     * Get the array representation of the notification.
     * This is what gets saved in the 'data' column of the database.
     */
    public function toArray($notifiable): array
    {
        return [
            'title' => 'Email Verified',
            'message' => 'Hey ' . $notifiable->fname . ', your account is now active. You can now log in.',
            'url' => $this->url,
            'type' => 'verification'
        ];
    }

}
