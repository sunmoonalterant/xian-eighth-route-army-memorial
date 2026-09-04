"""Formalize only the 25 explicitly authorized D11.5C people records."""
from __future__ import annotations
import argparse, json
from datetime import date
from pathlib import Path

APPROVED_IDS = {*(f'PEOPLE-{n:03d}' for n in range(1, 8)), *(f'PEOPLE-{n:03d}' for n in range(9, 27))}

# Local assets supplied by the project owner. Keys are candidate IDs so aliases
# such as “博古（秦邦宪）” and “海伦·福斯特·斯诺” remain unambiguous.
PERSON_IMAGE_PATHS = {
    'PEOPLE-001': '/images/people/zhou-enlai.jpeg',
    'PEOPLE-002': '/images/people/zhu-de.jpg',
    'PEOPLE-003': '/images/people/liu-shaoqi.webp',
    'PEOPLE-004': '/images/people/ye-jianying.jpg',
    'PEOPLE-005': '/images/people/lin-boqu.jpg',
    'PEOPLE-006': '/images/people/dong-biwu.jpg',
    'PEOPLE-014': '/images/people/norman-bethune.webp',
    'PEOPLE-015': '/images/people/dwarkanath-kotnis.webp',
    'PEOPLE-016': '/images/people/edgar-snow.jpg',
    'PEOPLE-017': '/images/people/helen-foster-snow.jpg',
    'PEOPLE-018': '/images/people/agnes-smedley.jpg',
    'PEOPLE-019': '/images/people/tan-kah-kee.jpg',
    'PEOPLE-020': '/images/people/deng-yingchao.jpg',
    'PEOPLE-022': '/images/people/bo-gu.jpg',
    'PEOPLE-024': '/images/people/deng-xiaoping.jpg',
    'PEOPLE-025': '/images/people/chen-geng.webp',
}

def build_reviewed(records, images):
    result=[]
    for record in records:
        row=record.get('originalRow', {})
        source=record.get('originalText', {}).get('sourceUrl')
        if record.get('candidateId') not in APPROVED_IDS or record.get('recommendedDecision') != 'APPROVE' or record.get('sourceLevel') not in {'A','B'} or not source:
            continue
        role=(row.get('身份/职务') or '').strip() or None
        relation=(row.get('与西安八办/七贤庄的关系') or '').strip() or None
        details=(row.get('关键细节') or '').strip() or None
        summary='。'.join(part for part in [role, relation] if part) or '人物资料已根据可信来源整理。'
        content='\n'.join(part for part in [f'身份/职务：{role}' if role else '', f'与西安八办/七贤庄的关系：{relation}' if relation else '', f'关键细节：{details}' if details else ''] if part)
        result.append({'candidateId':record['candidateId'],'name':row.get('姓名'),'role':role,'relation':relation,'summary':summary,'details':details,'content':content,'sourceUrl':source,'sourceType':record.get('originalText',{}).get('sourceType'),'sourceLevel':record.get('sourceLevel'),'evidence':record.get('recommendationReason'),'originalRole':role,'originalRelation':relation,'originalDetails':details,'verified':True,'reviewStatus':'verified','reviewedAt':date.today().isoformat(),'approvalMode':'manual-approved-d115c','image':PERSON_IMAGE_PATHS.get(record['candidateId'])})
    return result

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--people-review',type=Path,required=True); parser.add_argument('--image-review',type=Path,required=True); parser.add_argument('--output',type=Path,required=True); args=parser.parse_args()
    records=json.loads(args.people_review.read_text(encoding='utf-8')); images={r['candidateId']:r for r in json.loads(args.image_review.read_text(encoding='utf-8'))}
    reviewed=build_reviewed(records,images)
    if len(reviewed)!=25: raise ValueError(f'expected 25 approved people, got {len(reviewed)}')
    args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_text(json.dumps(reviewed,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(f'reviewed people: {len(reviewed)}')
if __name__=='__main__': main()
