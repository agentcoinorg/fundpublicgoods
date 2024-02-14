from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


categorize_prompt_template = """
Your goal is to categorize a project according to it's description. These are the existing categories:

- Decentralized Finance (DeFi)
- Artificial Intelligence (AI) Integration
- Blockchain Technology and Ecosystems
- Tokenomics and Cryptocurrency
- NFT (Non-Fungible Tokens) Marketplace and Integration
- Environmental Sustainability and Regenerative Practices
- Education and Knowledge Dissemination
- Health and Wellness
- Social Impact and Philanthropy
- Community Building and Governance
- Privacy and Security in Blockchain
- Gaming and Gamification
- Accessibility and Inclusivity
- Art, Music, and Cultural Preservation
- Legal and Regulatory Compliance
- Infrastructure and Tooling for Blockchain
- Research and Development in Blockchain
- Space Exploration and Technology
- Agriculture and Food Security
- Climate Action and Carbon Market
- Web3 Adoption and Education
- Public Goods and Civic Engagement
- Financial Tools and Services
- User Experience and Interface Design
- Conservation and Wildlife Protection
- Entrepreneurship and Business Development
- Science and Technology
- Energy and Renewable Resources
- Event Organization and Participation
- Translation and Multilingual Support
- Content Creation and Media Production
- Mental Health and Empowerment
- DAOs (Decentralized Autonomous Organizations)
- E-commerce and Retail Integration
- Software Development and Open Source
- Real Estate and Asset Tokenization
- Supply Chain Management and Transparency
- Digital Identity and Verification
- Networking and Professional Development
- Volunteerism and Community Support
- Career Development and Job Market
- Marketing and Branding Strategy
- Hardware Technology and Integration
- Data Analytics and Visualization
- Healthcare Integration and Innovation
- Grant Funding Mechanisms and Support
- Cybersecurity and Ethical Hacking
- Outreach and Advocacy
- Economic Empowerment and Microfinance
- Zero-Knowledge Proofs and Cryptography
- Intellectual Property and Copyright
- Risk Management and Insurance
- Quantum Computing and Advanced Technologies
- Human Rights and Ethical Practices
- Travel and Tourism
- Urban Development and Smart Cities
- Payment Systems and Digital Wallets
- Social Networking and Digital Communities
- Automation and Robotics
- Fashion and Textiles
- Conservation Through Gaming and VR
- Remote Work and Digital Nomadism
- Food and Beverage Industry
- Transportation and Mobility
- Waste Management and Recycling
- Disaster Relief and Crisis Management
- Youth Engagement and Education
- Mental Health and Counseling
- Women Empowerment and Gender Equality
- Indigenous Rights and Cultural Heritage
- Digital Rights and Internet Freedom
- Digital Sovereignty and Data Autonomy
- Social Justice and Equal Opportunity
- Livelihood Enhancement and Skills Training
- Mental Health Advocacy and Support Services
- Sustainable Agriculture and Permaculture
- Cryptocurrency Adoption and Integration
- Interoperability and Cross-Chain Solutions
- Climate Advocacy and Policy Influence
- Circular Economy and Sustainable Practices
- Veterinary Services and Animal Health
- Accessibility for People with Disabilities
- Humanitarian Aid and Refugee Support
- Local Community Initiatives and Empowerment
- Child Welfare and Development
- Public Health Initiatives and Disease Prevention
- Substance Abuse Prevention and Rehabilitation
- Financial Literacy and Consumer Education
- Digital Archiving and Historic Preservation
- Alternative Energy and Green Tech
- Public Transportation and Infrastructure
- Mental Health Research and Neurodiversity
- Military Veteran Support and Reintegration
- Cultural Festivals and Creative Events
- Digital Literacy and Computer Education
- Affordable Housing and Community Development
- Academic Research and Scholarly Publishing
- Social Entrepreneurship and Cooperative Business
- Mental Health Awareness and Education
- Digital Inclusion and Tech Accessibility

Consider that all projects are within the blockchain ecosystem and seeking public goods funding.
A project can have multiple categories. Be strict with assigning categories.

Respond strictly with a comma-separated list of categories, without quotes. Do not change the wording
or casing of the categories, return them exactly as they are written in the list above.

Some projects's descriptions will not have sufficient information to be categorized, even in a single category,
if that's the case, simply respond "NONE" (without quotes)

Project description:
{project_description}
"""


def categorize_project(project_descriptions: list[str]) -> list[list[str]]:
    categorize_prompt = ChatPromptTemplate.from_messages([
        ("system", categorize_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    categorize_chain = categorize_prompt | llm | StrOutputParser()

    category_strings = categorize_chain.batch([{
        "project_description": project_description
    } for project_description in project_descriptions])
    
    categories: list[list[str]] = []
    
    for category_string in category_strings:
        if category_string == "NONE":
            categories.append([])
        else:
            categories.append([category.strip() for category in category_string.split(",")])
            
    return categories