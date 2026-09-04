import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))

from d115c_reviewed_people import APPROVED_IDS, PERSON_IMAGE_PATHS, build_reviewed


class ReviewedPeopleTests(unittest.TestCase):
    def test_only_the_25_authorized_ids_are_formalized(self):
        rows = [
            {'candidateId': 'PEOPLE-001', 'recommendedDecision': 'APPROVE', 'sourceLevel': 'A', 'originalText': {'sourceUrl': 'https://official.test'}, 'originalRow': {'姓名': '甲', '身份/职务': '职务', '与西安八办/七贤庄的关系': '关系', '关键细节': '细节'}},
            {'candidateId': 'PEOPLE-008', 'recommendedDecision': 'PENDING', 'sourceLevel': 'C', 'originalText': {'sourceUrl': 'https://weak.test'}, 'originalRow': {'姓名': '乙'}},
        ]
        result = build_reviewed(rows, {})
        self.assertEqual([item['candidateId'] for item in result], ['PEOPLE-001'])
        self.assertEqual(len(APPROVED_IDS), 25)
        self.assertTrue(result[0]['verified'])
        self.assertEqual(result[0]['reviewStatus'], 'verified')

    def test_formalized_person_uses_its_curated_local_portrait_when_available(self):
        rows = [
            {'candidateId': 'PEOPLE-001', 'recommendedDecision': 'APPROVE', 'sourceLevel': 'A', 'originalText': {'sourceUrl': 'https://official.test'}, 'originalRow': {'姓名': '周恩来', '身份/职务': '职务', '与西安八办/七贤庄的关系': '关系', '关键细节': '细节'}},
        ]

        result = build_reviewed(rows, {})

        self.assertEqual(result[0]['image'], '/images/people/zhou-enlai.jpeg')

    def test_every_registered_person_image_is_present_in_frontend_public_assets(self):
        public_root = Path(__file__).resolve().parents[3] / 'frontend' / 'public'

        missing = [image_path for image_path in PERSON_IMAGE_PATHS.values() if not (public_root / image_path.lstrip('/')).is_file()]

        self.assertEqual(missing, [])


if __name__ == '__main__':
    unittest.main()
