<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoCallController;



/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('/video-call', [VideoCallController::class, 'index'])->name('video-call.index');
Route::post('/send-signal', [VideoCallController::class, 'sendSignal'])->name('video-call.send-signal');