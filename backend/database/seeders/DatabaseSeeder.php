<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'إدارة عمليات وردية - العاشر',
            'email' => 'admin@wardia.eg',
            'password' => Hash::make('wardia2026!'),
        ]);

        $this->call(WardiaSeeder::class);
    }
}
