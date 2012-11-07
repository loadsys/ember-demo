<?php
App::uses('AppController', 'Controller');

class PostsController extends AppController {
	public function index() {
		$this->Post->recursive = 0;
		$posts = $this->_transform($this->Post->find('all'));
		if (empty($posts)) {
			$posts = array('posts' => array());
		}
		$this->setBody($posts);
	}

	public function view() {
		$postId = $this->params('post_id');
		$this->Post->recursive = 0;
		$post = $this->_transform($this->Post->findById($postId));
		if (!empty($post)) {
			$this->setBody($post);
		} else {
			// Set failure statusCode
		}
	}

	public function add() {
		$post = array('post' => array());
		$data = $this->data('post');
		$this->Post->create();
		if (!empty($data) && $this->Post->save($data)) {
			$this->Post->recursive = 0;
			$post = $this->_transform($this->Post->findById($this->Post->id));
		} else {
			// Set failure statusCode
		}
		$this->setBody($post);
	}

	public function edit() {
		$postId = $this->params('post_id');
		$post = array('post' => array());
		$data = $this->data('post');
		$this->Post->id = $postId;
		if (!empty($data) && $this->Post->save($data)) {
			$this->Post->recursive = 0;
			$post = $this->_transform($this->Post->findById($postId));
		} else {
			// Set failure statusCode
		}
		return $this->setBody($post);
	}

	public function delete() {
		$postId = $this->params('post_id');
		if (!$this->Post->delete($postId)) {
			// Set failure statusCode
		}
		$this->setBody();
	}

	protected function _transform($data = array()) {
		if (empty($data)) {
			return array();
		}
		$return = array();
		if (is_numeric(key($data))) {
			foreach ($data as $post) {
				$return[] = $this->_transformPost($post);
			}
			$return = array('posts' => $return);
		} elseif (isset($data['Post'])) {
			$return = array('post' => $this->_transformPost($data));
		}
		return $return;
	}

	protected function _transformPost($post) {
		if (isset($post['Post']['Comment'])) {
			$post['Post']['comments'] = $post['Post']['Comment'];
			unset($post['Post']['Comment']);
		} elseif (isset($post['Comment'])) {
			$post['Post']['comments'] = $post['Comment'];
			unset($post['Comment']);
		}
		return $post['Post'];
	}
}
