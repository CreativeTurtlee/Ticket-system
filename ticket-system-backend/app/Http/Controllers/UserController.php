<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role');
        if ($role) {
            $users = User::with('roles')->whereHas('roles', function($q) use ($role) {
                $q->where('name', $role);
            })->get();
        } else {
            $users = User::with('roles')->get();
        }
        return response()->json($users);
    }

    public function updateRoles(Request $request, $id)
    {
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);
        $user = \App\Models\User::findOrFail($id);
        $roleIds = \App\Models\Role::whereIn('name', $validated['roles'])->pluck('id');
        $user->roles()->sync($roleIds);
        return response()->json(['success' => true, 'roles' => $user->roles()->pluck('name')]);
    }

    public function rolesList()
    {
        $roles = \App\Models\Role::all();
        return response()->json($roles);
    }

    public function destroy($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();
        return response()->json(['success' => true]);
    }
} 