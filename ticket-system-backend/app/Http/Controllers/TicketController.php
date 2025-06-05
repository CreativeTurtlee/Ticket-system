<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles()->pluck('name')->toArray();

        if (in_array('admin', $roles)) {
            $tickets = Ticket::with(['status', 'author', 'assignedTo'])->get();
        } elseif (in_array('specialist', $roles)) {
            $tickets = Ticket::with(['status', 'author', 'assignedTo'])
                ->where('assigned_to', $user->id)
                ->get();
        } else {
            $tickets = Ticket::with(['status', 'author', 'assignedTo'])
                ->where('user_id', $user->id)
                ->get();
        }

        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $roles = $request->user()->roles()->pluck('name')->toArray();
        if (!in_array('user', $roles)) {
            return response()->json(['error' => 'Только пользователи могут создавать заявки'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file' => 'nullable|file|max:2048',
        ]);

        $ticket = new \App\Models\Ticket();
        $ticket->title = $validated['title'];
        $ticket->description = $validated['description'];
        $ticket->user_id = $request->user()->id;
        $ticket->status_id = \App\Models\TicketStatus::where('name', 'Новая')->first()->id;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('tickets', 'public');
            $ticket->file = $path;
        }

        $ticket->save();

        return response()->json($ticket, 201);
    }

    public function update(Request $request, $id)
    {
        $ticket = \App\Models\Ticket::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
            'status_id' => 'nullable|exists:ticket_statuses,id',
            // можно добавить другие поля для обновления в дальнейшем
        ]);

        if (isset($validated['assigned_to'])) {
            $ticket->assigned_to = $validated['assigned_to'];
        }
        if (isset($validated['status_id'])) {
            $ticket->status_id = $validated['status_id'];
        }

        $ticket->save();

        return response()->json($ticket);
    }

    public function stats()
    {
        $total = \App\Models\Ticket::count();
        $byStatus = \App\Models\Ticket::with('status')
            ->get()
            ->groupBy(fn($t) => $t->status->name)
            ->map(fn($g) => $g->count());

        $bySpecialist = \App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'specialist'))
            ->withCount(['assignedTickets'])
            ->orderByDesc('assigned_tickets_count')
            ->take(5)
            ->get(['id', 'name', 'assigned_tickets_count']);

        return response()->json([
            'total' => $total,
            'by_status' => $byStatus,
            'by_specialist' => $bySpecialist,
        ]);
    }

    public function statusesList()
    {
        $statuses = \App\Models\TicketStatus::all();
        return response()->json($statuses);
    }
} 