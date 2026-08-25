import json
import unittest
from app import app

class FlaskMLTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_home_route(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("service"), "Student Management + ML API")
        self.assertEqual(data.get("status"), "running")
        self.assertEqual(data.get("model_loaded"), True)

    def test_valid_prediction_pass(self):
        res = self.client.post('/api/predict', data=json.dumps({"study_hours": 6, "attendance": 85}), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data, {"prediction": "Pass"})

    def test_valid_prediction_fail(self):
        res = self.client.post('/api/predict', data=json.dumps({"study_hours": 1, "attendance": 35}), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data, {"prediction": "Fail"})

    def test_missing_study_hours(self):
        res = self.client.post('/api/predict', data=json.dumps({"attendance": 85}), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_missing_attendance(self):
        res = self.client.post('/api/predict', data=json.dumps({"study_hours": 6}), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_empty_json(self):
        res = self.client.post('/api/predict', data=json.dumps({}), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_no_body(self):
        res = self.client.post('/api/predict')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_wrong_data_type(self):
        res = self.client.post('/api/predict', data=json.dumps({"study_hours": "six", "attendance": 85}), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_invalid_values(self):
        res = self.client.post('/api/predict', data=json.dumps({"study_hours": -5, "attendance": 150}), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

if __name__ == '__main__':
    unittest.main()
