<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StaffInvitation extends Notification implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)->subject('KL Website — secure staff access')->line('Use this one-time link to set your password. New staff must also enrol an authenticator app.')->action('Set up staff access', url('/admin/activate').'?'.http_build_query(['token' => $this->token, 'email' => $notifiable->email]))->line('The link expires after 60 minutes. If you did not expect this message, ignore it.');
    }
}
