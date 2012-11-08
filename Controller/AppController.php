<?php
App::uses('Controller', 'Controller');

class AppController extends Controller {
	public $autoRender = false;

	/**
	 * Shortcut to the params to save space
	 *
	 * @access protected
	 * @param string $key
	 * @return mixed
	 */
	protected function params($key = null) {
		if (!$key) {
			return $this->request->params;
		}
		return $this->request->params[$key];
	}

	/**
	 * Shortcut to the params to save space
	 *
	 * @access protected
	 * @return mixed
	 */
	protected function data($key = null) {
		$return = null;
		$data = $this->formData();
		if (!$key) {
			$return = $data;
		} else {
			if (isset($data[$key])) {
				$return = $data[$key];
			}
		}
		return $return;
	}

	/**
	 * Shortcut to set the response body to json_encoded $content
	 * @access protected
	 * @param array $content
	 */
	protected function setBody($content = array()) {
		$this->response->body(json_encode($content));
	}

	/**
	 * Reads the post data from the php://input stream and transforms it into
	 * an associative array, returning the array.
	 *
	 * @access protected
	 * @return array
	 */
	protected function formData() {
		$data = array();
		if ($this->request->is('put')) {
			$data = json_decode($this->request->data, true);
		} else {
			$data = json_decode(file_get_contents('php://input'), true);
		}
		return $data;
	}
}
