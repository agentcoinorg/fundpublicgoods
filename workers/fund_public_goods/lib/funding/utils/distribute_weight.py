def distribute_weights(weights: list[float], total: float, decimals: int):
    # Convert the total to its smallest unit representation
    total_in_smallest_unit = total * 10**decimals

    # Calculate initial amounts in the smallest unit
    amounts = [int(weight * total_in_smallest_unit) for weight in weights]

    # Calculate the remainder
    remainder = total_in_smallest_unit - sum(amounts)

    # Distribute the remainder
    while remainder > 0:
        max_fractional_part = -1
        index = -1
        for idx, amount in enumerate(amounts):
            fractional_part = weights[idx] * total_in_smallest_unit - amount
            if fractional_part > max_fractional_part:
                max_fractional_part = fractional_part
                index = idx

        if index == -1:
            break  # Break if no suitable item is found

        amounts[index] += 1
        remainder -= 1

    return amounts
