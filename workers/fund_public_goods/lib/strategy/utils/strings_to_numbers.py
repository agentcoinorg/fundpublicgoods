def strings_to_numbers(strings: list[str]):
    numbers = []
    for item in strings:
        try:
            # Convert to integer and append to the list
            numbers.append(int(item))
        except ValueError:
            # If conversion fails, append None
            numbers.append(None)
    return numbers
