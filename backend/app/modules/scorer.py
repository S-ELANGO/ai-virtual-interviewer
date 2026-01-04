def calculate_final_score(evaluations):
    if not evaluations:
        return 0

    total_score = 0
    for eval_data in evaluations:
        # Assuming evaluation is a dict with 'overall_score'
        total_score += eval_data.get('overall_score', 0)
    
    final_score = total_score / len(evaluations)
    return round(final_score, 2)
