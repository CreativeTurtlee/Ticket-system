<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TicketStatusesTableSeeder extends Seeder
{
    public function run()
    {
        \DB::table('ticket_statuses')->insert([
            ['name' => 'Новая'],
            ['name' => 'В работе'],
            ['name' => 'Выполнена'],
            ['name' => 'Закрыта'],
        ]);
    }
} 