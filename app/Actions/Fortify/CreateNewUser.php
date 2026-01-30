<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {

        $messages = [
            'password.regex' => 'Your password must contain at least one uppercase letter, one number, and one special character.',
            // 'fname.required' => 'Please tell us your first name.',
        ];


        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'fname' => ucfirst($input['fname']),
            'lname' => ucfirst($input['lname']),
            'email' => $input['email'],
            'password' => $input['password'],
        ]);
    }
}
