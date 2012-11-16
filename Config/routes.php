<?php
Router::connect('/', array('controller' => 'pages', 'action' => 'home'));

Router::connect(
	'/api/posts',
	array('controller' => 'posts', 'action' => 'index', '[method]' => 'GET')
);

Router::connect(
	'/api/posts',
	array('controller' => 'posts', 'action' => 'add', '[method]' => 'POST')
);

Router::connect(
	'/api/posts/:post_id',
	array('controller' => 'posts', 'action' => 'view', '[method]' => 'GET'),
	array('post_id' => '[0-9]+')
);

Router::connect(
	'/api/posts/:post_id',
	array('controller' => 'posts', 'action' => 'edit', '[method]' => 'PUT'),
	array('post_id' => '[0-9]+')
);

Router::connect(
	'/api/posts/:post_id',
	array('controller' => 'posts', 'action' => 'delete', '[method]' => 'DELETE'),
	array('post_id' => '[0-9]+')
);

Router::connect(
	'/api/comments',
	array('controller' => 'comments', 'action' => 'index', '[method]' => 'GET')
);

Router::connect(
	'/api/comments',
	array('controller' => 'comments', 'action' => 'add', '[method]' => 'POST')
);

// CakePlugin::routes();
// require CAKE . 'Config' . DS . 'routes.php';
