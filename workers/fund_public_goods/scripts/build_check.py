import subprocess
import sys

def run():
    # Run mypy check
    result = subprocess.run(["mypy", "."], capture_output=True)
    print(result.stdout.decode())
    if result.returncode != 0:
        print("Type checking failed")
        sys.exit(1)

    # Proceed with build
    subprocess.run(["poetry", "build"])