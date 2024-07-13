<?php


namespace App\Http\Controllers;

use App\Events\VideoCallSignal;
use Illuminate\Http\Request;
use Inertia\Inertia;


class VideoCallController extends Controller
{
    public function index()
    {
        // die('lala');
        return Inertia::render('Home');
    }
    
    public function sendSignal(Request $request)
    {
        $signalData = $request->input('signal');

        // Broadcast the signal to the 'video-call' private channel
        broadcast(new VideoCallSignal($signalData))->toOthers();
    
        return response()->json(['message' => 'Signal sent successfully']);
    }
}