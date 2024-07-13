import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/inertia-vue3';
import { InertiaProgress } from '@inertiajs/progress';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Pusher
window.Pusher = Pusher;

// Initialize Laravel Echo
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    encrypted: true, // Change to false if not using HTTPS
    forceTLS: true,  // Ensures the use of TLS/SSL
});

// Initialize InertiaJS app
createInertiaApp({
    resolve: name => require(`./Pages/${name}`).default,
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
});

// Initialize InertiaJS progress
InertiaProgress.init();
