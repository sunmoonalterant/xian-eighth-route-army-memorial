import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from d115b_people_image_review import (  # noqa: E402
    classify_image_lead,
    find_duplicate_image_bindings,
    localization_candidates,
)


class D115BPeopleImageReviewTests(unittest.TestCase):
    def test_exterior_image_lead_remains_missing_and_is_not_a_portrait(self):
        result = classify_image_lead(
            "周恩来",
            "纪念馆外景照片（中国共产党新闻网）；历史照片建议取官方档案",
            "http://example.test/page",
            "人民网党史频道",
        )

        self.assertEqual(result["status"], "missing")
        self.assertTrue(result["relatedVisualAvailable"])
        self.assertEqual(result["relatedImageType"], "site")
        self.assertFalse(result["image"]["recommendedForUse"])

    def test_handwriting_lead_is_recorded_as_related_artifact_not_portrait(self):
        result = classify_image_lead(
            "叶剑英",
            "叶剑英题诗手迹/题字图片（官网文物页）",
            "http://example.test/relic",
            "纪念馆官网",
        )

        self.assertEqual(result["status"], "missing")
        self.assertEqual(result["relatedImageType"], "handwriting")
        self.assertEqual(result["suggestedUse"], "relatedArtifact")

    def test_unidentified_group_photo_is_uncertain_and_not_recommended_for_portrait(self):
        result = classify_image_lead(
            "白求恩",
            "白求恩、柯棣华合影照片（媒体报道）",
            "http://example.test/article",
            "媒体报道",
        )

        self.assertEqual(result["status"], "uncertain")
        self.assertEqual(result["imageType"], "group")
        self.assertFalse(result["image"]["recommendedForUse"])
        self.assertEqual(result["suggestedUse"], "contentImage")

    def test_person_activity_photo_remains_uncertain_when_the_same_lead_mentions_artifacts(self):
        result = classify_image_lead(
            "宣侠父",
            "宣侠父书写照片（文化报道）；长袍/合影图片（官网文物页）",
            "http://example.test/article",
            "纪念馆官网",
        )

        self.assertEqual(result["status"], "uncertain")
        self.assertEqual(result["imageType"], "content")

    def test_unreachable_source_page_is_not_treated_as_identity_evidence(self):
        result = classify_image_lead(
            "埃德加·斯诺",
            "采访包图片/斯诺照片（媒体报道）",
            "https://www.xxbcm.com/info/1050/100400.htm",
            "媒体报道",
        )

        self.assertEqual(result["status"], "uncertain")
        self.assertEqual(result["sourcePageAvailability"], "unavailableDuringAudit")
        self.assertIn("证书", result["image"]["notes"])

    def test_only_confirmed_recommended_images_are_localization_candidates(self):
        records = [
            {
                "candidateId": "PEOPLE-001",
                "name": "甲",
                "image": {"status": "confirmed", "recommendedForUse": True, "sourceUrl": "https://example.test/a.jpg", "sourcePageUrl": "https://example.test/a", "publisher": "机构"},
            },
            {
                "candidateId": "PEOPLE-002",
                "name": "乙",
                "image": {"status": "uncertain", "recommendedForUse": True, "sourceUrl": "https://example.test/b.jpg", "sourcePageUrl": "https://example.test/b", "publisher": "机构"},
            },
        ]

        self.assertEqual(
            localization_candidates(records),
            [{
                "candidateId": "PEOPLE-001",
                "name": "甲",
                "imageSourceUrl": "https://example.test/a.jpg",
                "sourcePageUrl": "https://example.test/a",
                "publisher": "机构",
                "suggestedFilename": "jia.jpg",
                "approvedForDownload": False,
            }],
        )

    def test_duplicate_detection_ignores_unusable_or_distinct_images(self):
        records = [
            {"candidateId": "PEOPLE-001", "image": {"status": "confirmed", "recommendedForUse": True, "sourceUrl": "https://example.test/shared.jpg"}},
            {"candidateId": "PEOPLE-002", "image": {"status": "confirmed", "recommendedForUse": True, "sourceUrl": "https://example.test/shared.jpg"}},
            {"candidateId": "PEOPLE-003", "image": {"status": "uncertain", "recommendedForUse": False, "sourceUrl": "https://example.test/shared.jpg"}},
        ]

        self.assertEqual(
            find_duplicate_image_bindings(records),
            [{"sourceUrl": "https://example.test/shared.jpg", "candidateIds": ["PEOPLE-001", "PEOPLE-002"]}],
        )


if __name__ == "__main__":
    unittest.main()
