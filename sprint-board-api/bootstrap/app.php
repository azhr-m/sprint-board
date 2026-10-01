<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Always answer API requests with JSON, even without an Accept header.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'errors' => $e->errors(),
                ], $e->status),
                $e instanceof AuthenticationException => response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                ], 401),
                $e instanceof ModelNotFoundException,
                $e instanceof NotFoundHttpException => response()->json([
                    'success' => false,
                    'message' => 'Resource not found.',
                ], 404),
                $e instanceof HttpExceptionInterface => response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Request failed.',
                ], $e->getStatusCode(), $e->getHeaders()),
                default => config('app.debug') ? null : response()->json([
                    'success' => false,
                    'message' => 'Server error.',
                ], 500),
            };
        });
    })->create();
