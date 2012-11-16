<?php
App::uses('AppController', 'Controller');

class CommentsController extends AppController {
	public function index() {
		$this->Comment->recursive = 0;
		$comments = $this->_transform($this->Comment->find('all'));
		$this->setBody(array('comments' => $comments['Comment']));
	}

	public function add() {
		$comment = array();
		if ($this->Comment->createComment($this->data())) {
			$this->Comment->recursive = 0;
			$comment = $this->_transform($this->Comment->findById($this->Comment->id));
		} else {
			// Set failure statusCode
		}
		$this->setBody($comment);
	}

	public function delete() {
		$commentId = $this->params('comment_id');
		if (!$this->Comment->deleteComment($commentId)) {
			// Set failure statusCode
		}
		$this->setBody();
	}

	protected function _transform($data = array()) {
		if (empty($data)) {
			return array();
		}
		if (isset($data['Comment']) && is_numeric(key($data['Comment']))) {
			$mainKey = 'comments';
		} elseif (isset($data['Comment'])) {
			$mainKey = 'comment';
		} else {
			return array();
		}
		$data[$mainKey] = $data['Comment'];
		unset($data['Comment']);
		return $data;
	}
}
