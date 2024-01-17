from researcher.functions.plan_research import plan_research
from dotenv import load_dotenv

load_dotenv()

def main():
    result = plan_research("I like trees")
    print(result)

if __name__ == '__main__':
    main()
