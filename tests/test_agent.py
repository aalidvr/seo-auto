import unittest, asyncio, json, sys
sys.path.insert(0,'agent')
from seo_agent import SEOAgent, ModelGateway, AgentError, require_json
class Tests(unittest.TestCase):
 def test_json_validation(self):
  self.assertEqual(require_json('```json\n{"x":1}\n```'),{'x':1})
  with self.assertRaises(Exception):require_json('{invalid')
 def test_full_matrix(self):
  result=asyncio.run(SEOAgent(ModelGateway(mock=True)).run({'primary_keyword':'سئو','content_type':'blog'}))
  self.assertEqual(len(result['review_matrix']),15)
  self.assertEqual(len(result['trace']),37)
  self.assertFalse(result['publish_allowed'])
 def test_no_approval_bypass(self):
  with self.assertRaises(AgentError):asyncio.run(SEOAgent(ModelGateway(mock=True)).run({'primary_keyword':'x','content_type':'blog','human_approval_required':False}))
 def test_profiles(self):
  for profile in ['balanced','economy']:
   result=asyncio.run(SEOAgent(ModelGateway(mock=True),profile).run({'primary_keyword':'x','content_type':'blog'}))
   self.assertEqual(result['status'],'awaiting_human_approval')
if __name__=='__main__':unittest.main()
