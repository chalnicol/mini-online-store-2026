<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $url;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $url)
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

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('')
            ->view('emails.password_changed', [
                'user' => $notifiable, // $notifiable is the User model
                'url' => $this->url,
            ]);
    }


    public function toBroadcast(object $notifiable): array
    {
        //..
    }

    /**
     * Get the array representation of the notification for the database channel.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toDatabase($notifiable)
    {
        return [
            'title' => 'Password Changed Successfully',
            'message' => 'Hey ' . $notifiable->fname . ', your password has been changed successfully. If this was not you, please contact support.',
            'url' => $this->url,
            'type' => 'verification'
        ];
    }

}
