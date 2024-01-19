import inngest
import datetime
from fund_public_goods.events import CreateStrategyEvent
from fund_public_goods.db import client, logs, projects, strategy_entries

def add_mock_data(supabase, run_id):
    project_ids = []
    project_ids.append(projects.insert(
        supabase,
        "Magnus OpenAI",
        "0x9c162E77B67Ed76164B486E2305000c10e3B9DfE",
        "Project \"MagnusAI: Artificial Intelligence Synthesis in the Cryptocurrency World\"\n\nWelcome to the world of innovation and advanced technologies in the field of cryptocurrencies and blockchain! The \"MagnusAI\" project aims to introduce an intelligent agent that will revolutionize and streamline operations in cryptocurrency markets.\n\n\nProject Features:\n\n1. Market Trend Prediction: MagnusAI uses data analysis and machine learning to predict market trends, helping investors make informed decisions regarding buying, selling, and portfolio management.\n\n2. Optimization of Trading Strategies: We are developing MagnusAI, an intelligent agent capable of adapting to changes in the market and optimizing trading strategies in real-time, ensuring maximum profits and minimizing risks.\n\n3. Automated Trading: MagnusAI allows for the automation of trading operations, making the trading process more efficient and reducing potential errors.\n\n4. Security and Confidentiality: We emphasize security and confidentiality. MagnusAI employs advanced encryption methods and blockchain technology to ensure secure and confidential information exchange.\n\n\nOpportunities and Advantages:\n\n1. Rational Investment Decisions: Thanks to the analysis of a large volume of data and the prediction of market trends, MagnusAI helps investors make rational and informed decisions regarding their cryptocurrency investments.\n\n2. Effective Portfolio Management System: We offer an efficient portfolio management system that allows for the automation and optimization of asset management in a cryptocurrency portfolio.\n\n3. Innovative Solutions for the Market: MagnusAI enables the implementation of innovative approaches to trading and investing in cryptocurrency markets, contributing to the development of this crucial segment of the financial world.\n\n4. Flexibility and Adaptability: MagnusAI is flexible and adaptive to changes in the market, making it a powerful tool for those looking to successfully optimize their cryptocurrency strategy.\n\nJoin the MagnusAI project and discover a new level of efficiency and innovation in the world of cryptocurrencies and blockchain technologies!\n\n\nWhy Invest in MagnusAI?\n\nMagnusAI represents the future of intelligent cryptocurrency investing. Our project is at the forefront of technological innovation, combining cutting-edge artificial intelligence with the dynamic and ever-evolving landscape of the cryptocurrency market.\n\nWe invite you to be part of this exciting venture. By investing in MagnusAI, you are not just investing in a project; you are investing in the future of smart, efficient, and profitable cryptocurrency management.\n\nDon't Miss Out on the Future \u2013 Invest in MagnusAI Today!\n\nThank you for considering MagnusAI as your gateway to intelligent cryptocurrency investing. We look forward to welcoming you to our community of forward-thinking investors.",
        "https://www.magnusai.tilda.ws"
    ))
    project_ids.append(projects.insert(
        supabase,
        "DeCenter AI",
        "0xe86DB685cB285B435BE8892cCf2b51F641A000dF",
        "DeCenter AI is a no-code Platform-as-a-Service that empowers developers on Polygon to build and launch AI-powered DApps. We enable developers to train, access, and deploy AI models to enhance the user experience, profitability and personalization of their DApps.\n\nProblem: Building custom AI-powered DApps can be cost-prohibitive and resource-intensive, especially given the current absence of dedicated AI infrastructure for web3 projects.\n\nSolution: Platform-as-a-Service for rapid and affordable AI powered dapp development with a decentralized and democratized scalable AI Infrastructure for all web3 projects.\n\nBenefits to Developers\nRapidly launch AI Powered Dapps with Ease: Developers can swiftly deploy AI-powered decentralized applications (Dapps) using DeCenter AI's intuitive platform, reducing development time and complexity.\n\nTrade and access AI Models as NFTs: Dapp developers gain the ability to trade and access AI models as Non-Fungible Tokens (NFTs), providing a novel approach to model ownership and collaboration.\n\nManage multiple Dapps from one dashboard: DeCenter AI streamlines Dapp management by allowing developers to oversee and control multiple decentralized applications through a centralized and user-friendly dashboard.\n\nBenefits of End Users\nGreater Yield (APY) on Defi Dapps: Dapp users can enjoy higher Annual Percentage Yield (APY) on decentralized finance (Defi) applications, maximizing their returns on investments.\n\nImmersive experience on web3 games: Users can immerse themselves in a more engaging and interactive experience on web3 games, enhanced by AI-powered features provided by DeCenter AI.\n\nPersonalization: DeCenter AI brings a personalized touch to Dapp usage, tailoring experiences to individual preferences and needs for a more user-centric interaction.\n\n\nImpact on the Polygon Ecosystem\nInfrastructure and Tooling: We are going to be the first AI infrastructure project On the ecosystem providing tools for developers building on polygon\n\nDapp Development: We plan to enable developers to build 100s of AI powered Dapps on Polygon within the first 12 months.\n\nPolygon SPN: As the pioneer AI infrastructure project on the ecosystem, we aim to be a vital part of the Polygon Solution Provider Network",
        "https://www.decenterai.com"
    ))
    strategy_entries.insert(
        supabase,
        run_id,
        project_ids[0],
        "some good reason",
        0.90,
        0.85,
        0.65
    )
    strategy_entries.insert(
        supabase,
        run_id,
        project_ids[1],
        "Another good reason",
        0.85,
        0.76,
        0.45
    )



@inngest.create_function(
    fn_id="on_create_strategy",
    trigger=CreateStrategyEvent.trigger,
)
async def create_strategy(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    data = CreateStrategyEvent.Data.model_validate(ctx.event.data)
    prompt = data.prompt
    run_id = data.run_id
    supabase = client.create_admin()

    await step.run(
        "getting_info",
        lambda: logs.insert(
            supabase,
            run_id,
            "Getting information from data sources"
        ),
    )

    await step.run(
        "add_mock_data",
        lambda: add_mock_data(supabase, run_id)
    )

    await step.sleep("zzzz1", datetime.timedelta(seconds=3))
    await step.run(
        "assessing",
        lambda: logs.insert(
            supabase,
            run_id,
            "Assessing impact of each project realted to the users interest",
        ),
    )

    await step.sleep("zzzz2", datetime.timedelta(seconds=3))
    await step.run(
        "determine",
        lambda: logs.insert(
            supabase,
            run_id,
            "Determining the relative funding that the best matching projects need",
        ),
    )

    await step.sleep("zzzz3", datetime.timedelta(seconds=3))
    await step.run("result", lambda: logs.insert(
        supabase,
        run_id,
        "Generating results"
    ))

    await step.sleep("zzzz4", datetime.timedelta(seconds=3))
    await step.run("result", lambda: logs.insert(
        supabase,
        run_id,
        "STRATEGY_CREATED"
    ))

    return "Done"
