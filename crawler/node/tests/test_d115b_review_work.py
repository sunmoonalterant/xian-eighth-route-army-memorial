import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from d115b_review_work import candidate_id_for, parse_time_fields, recommend_decision


class D115BReviewWorkTests(unittest.TestCase):
    def test_candidate_ids_are_stable_per_module_and_sequence(self):
        self.assertEqual(candidate_id_for("P0-历史人物", 1), "PEOPLE-001")
        self.assertEqual(candidate_id_for("P1-文物", 17), "RELIC-017")

    def test_winter_time_preserves_text_without_inventing_a_month_or_day(self):
        self.assertEqual(
            parse_time_fields("1934年冬"),
            {
                "timeText": "1934年冬",
                "year": 1934,
                "month": None,
                "day": None,
                "precision": "year",
            },
        )

    def test_known_source_conflict_overrides_an_otherwise_strong_candidate(self):
        decision, reason = recommend_decision(
            module="visit",
            source_level="A",
            source_url="http://example.test/current-notice",
            original_status="存在口径差异，标注待确认",
            has_core_fields=True,
            weak_only=False,
        )
        self.assertEqual(decision, "CONFLICT")
        self.assertIn("口径差异", reason)

    def test_strong_person_relationship_can_be_recommended_without_a_portrait(self):
        decision, reason = recommend_decision(
            module="people",
            source_level="B",
            source_url="http://dangshi.people.com.cn/example",
            original_status="已核验，建议入候选库",
            has_core_fields=True,
            weak_only=False,
        )
        self.assertEqual(decision, "APPROVE")
        self.assertIn("文字", reason)

    def test_official_courtyard_notice_with_unverified_use_stays_pending(self):
        decision, reason = recommend_decision(
            module="courtyard",
            source_level="A",
            source_url="http://www.xabb.org.cn/cultureInfo/3.html",
            original_status="已核验（公告线索），用途待核实",
            has_core_fields=True,
            weak_only=False,
        )
        self.assertEqual(decision, "PENDING")
        self.assertIn("用途", reason)


if __name__ == "__main__":
    unittest.main()
