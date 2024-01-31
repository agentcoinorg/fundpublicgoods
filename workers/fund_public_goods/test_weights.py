# [0.11, 0.13, 0.09999999999999999, 0.1, 0.12, 0.06, 0.1, 0.09, 0.1, 0.09]
def get_weights():
    return [0.15, 0.14, 0.12, 0.11, 0.15, 0.08, 0.15, 0.12, 0.08]

def adjust_weights_for_sum(weights, target_sum=1.0, precision=2):
    # Adjust initial weights to make their sum equal to target_sum
    excess = (sum(weights) - target_sum) / len(weights)
    adjusted_weights = [weight - excess for weight in weights]
    
    # Round adjusted weights to specified precision
    rounded_weights = [round(weight, precision) for weight in adjusted_weights]
    
    # Correct for any discrepancies caused by rounding
    correction = round(target_sum - sum(rounded_weights), precision)
    for i in range(len(rounded_weights)):
        if correction == 0:
            break
        adjustment = round(min(max(correction, -0.01), 0.01), precision)
        rounded_weights[i] += adjustment
        correction = round(correction - adjustment, precision)
    
    return rounded_weights

if __name__ == "__main__":
    weights = get_weights()
    adjusted_weights = adjust_weights_for_sum(weights)
    print(f"Adjusted and rounded weights: {adjusted_weights}")
    print(f"Sum of adjusted and rounded weights: {sum(adjusted_weights)}")
