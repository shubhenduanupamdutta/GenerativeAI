# Generative AI for DevSecOps and Testing

Not a comprehensive note, just jotting down interesting/important points

---

## Role of AI in CI/CD

---

### Automated Testing and Quality Assurance

- Automates Testing Process
- Generates Test Cases
- Identifies Bugs and Vulnerabilities

### Code Analysis and Optimization

- Employs AI to Analyze Code Quality
- Detects patterns and code issues
- Suggests Optimizations
- Detect Security Vulnerabilities
- Recommends Best Practices
- Detect Code Smells
- Faster Delivery of High-Quality Software

### Software Deployment

- Analyzes historical data and environment factors
- Predicts deployment risks
- Enables proactive issue resolution
- Optimizes Delivery

### Release Orchestration

- Schedule software component deployments
- Understand dependencies and constraints
- Adapts to Change
- Ensures Smooth Release Process

### Monitoring and Feedback

- Detect Security Threats
- Enables instant resolution
- Ensures System Reliability
- Analyzes User Feedback
- Identifies Improvement Areas

---

## AI Enabled CI/CD Tools and Platforms

---

- **Jenkins:** Possess CI/CD capabilities with AI plugins
- **IBM Watson Studio and Watson Machine Learning:** Offers DevOps automation for Machine Learning
- **CodeFresh:** Enhances the development process by predictive scaling
- **GitLab CI/CD:** Streamlines CI/CD with AI-driven insights
- **PagerDuty:** Aids engineering teams in incident management
- **Harness:** Uses AI to help software release processes
- **Snyk:** Incorporates AI for automated security testing and vulnerability management
- **Dynatrace's Davis:** Manages complex IT environments with AI
- **Darktrace:** Uses AI for cybersecurity and threat detection, simulates potential attacks
- **Aquasecurity:** Risks, Code breaches, Open Passwords

---

## Future Trends and Considerations

---

### AI-Driven Operationalization

- Enhances performance of applications
- Generates information for continuous delivery
- Anticipates Service Defects

### Elevating Delivery Health Insights

- Provides real-time insights into delivery health and release quality
- Clarifies decisions rationale
- Enhances model utilization
- Assists in taking proper data-driven actions

### Automated Verification

- Empowers SREs (Site Reliability Engineers) to analyze data
- Accelerates Software Verification
- Facilitates faster incident resolution by automated decision-making

---

## AI Integration in Cybersecurity

---

### Gmail leveraging machine learning

- Autonomous Adjustments
- Analyzes user behavior
- Detects anomalies

### IBM Watson

- Knowledge consolidation
- Threat detection

### Balbix Security Cloud

- Risk Prediction
- Vulnerability Management
- Proactive breach control
- Efficient Cybersecurity

### Juniper network's development of self-driving networks

- Network Challenges

---

## AI application in Cybersecurity

---

- Safeguards digital ecosystems
- Automate Code Reviews to detect flaws and enhance security
- Static Application Security Testing (SAST) scans helps to avoid false threats
- Dynamic Application Security Testing (DAST) simulates attacks and identifies vulnerabilities
- Intelligent threat modelling designs and reviews to identify security threats
- Vulnerability prioritization on severity, yielding efficient resolution
- User and Entity Behavior Analytics (UEBA) detects suspicious activities
- Predictive analytics anticipates and mitigates potential threats
- NLP ensures security in development documentation
- Automated patch management ensures timely software updates
- Security chatbots assist developers in real-time security guidance

---

## AI in cybersecurity: Shortcomings

---

### Limited Resource Intensity

Organization has limited budget and require storage and computational capabilities, making it difficult to implement AI solutions, because AI demands:

- High storage capacity
- High computational power

### Data Pre-requisites

AI Lacks data pre-requisites. Security firm need diverse anomalies and datasets to train AI models effectively

- Acquiring precise data is resource intensive

### Cyber Intrusions

- Cyber attackers harness AI to elevate malicious software
- Causing significant threats

---

## AI Code generation and Security

---

Integrating AI code generators present promising efficiencies and looming security concerns in today's software development landscape.

Hackers can harness AI driven tools for malicious purposes.

### Inadequate supervision and checks of AI generated code can lead to security breaches

- **Injection Attacks:** SQL Injection, Cross-Site Scripting (XSS) or similar injection flaws
- **Vulnerable third party libraries:** AI tools may suggest libraries with known vulnerabilities since usually they are trained with older data
- **Model poisoning and adversarial attacks:** Malicious data injection during model training or misleading inputs can lead to model poisoning or adversarial attacks
- **Resource Exhaustion:** AI-generated code may be inefficient, leading to performance issues and potential denial of service (DoS) vulnerabilities

---

## Secure Coding Tools

---

### Qwiet AI Pre-Zero Platform

- Integrates security in CI/CD pipeline
- Provides rapid feedback
- Addresses high priorities code vulnerabilities

### Snyk Code

- Analyzes code for vulnerabilities
- Offers actionable remediation advice

### GitHub Advanced Security

- Simplifies Vulnerability Detection
- Offers auto-fix suggestions
- Helps resolve issues

### Veracode Fix

- Suggests remediation for security flaws
- Leveraging Veracodde's proprietary datasets

### Endor Labs

- Offers DroidGPT
- Helps choose secure and updated components

### Microsoft Security Copilot

- Assists in investigation
- Responds to security incidents

### BurpGPT

- Uses GPT to analyze HTTP requests and responses

### EscalateGPT

- Identifies privilege escalation vulnerabilities in code
- Uses GPT in misconfigured IAM policies

---

## Security Enterprise Platform and Solutions

---

### Sophos Intercept X - Endpoint protection solution

- Uses Deep Learning
- Helps identify and respond to threats
- Learns endpoint behavior patterns
- Detects known and unknown threats

### Symantec Endpoint Security - AI driven threat detection

- Features Machine Learning for malware protection
- Identifies vulnerabilities
- Prevents damaging attacks

### Splunk User Behavior Analytics

- Focuses on user behavior
- Establishes a baseline for user activities
- Recognizes potential breaches

### Vectra Threat Detection and Response

- Utilizes behavioral analytics
- Identifies and stops threats
- Minimizes false positives

### IBM QRadar Advisor with Watson

- Automates Security Operations
- Analyzes Anomalies
- Offers root cause without human intervention
- Protects from threats

---

## AI Software Development Tools

---

### AI-Powered Code Review Tools

- **DeepCode**
- **CodeScene**
- **Github Copilot**
- **PullRequest.ai**
- **CodeClimate**
- **Snyk**

### AI-Powered Debugging Tools

- **Sentry**
- **DeepCode**
- **DeepScan**
- **Testim**
- **Mabl**
- **Codacy**
- **XRebel**

### AI Tools for Documentat

- **Doxygen**
- **NaturalDocs**
- **Mintlify**
- **DocuWriter.ai**

### AI Tools for Teaching and Learning

- **7Taps**
- **Quizgecko**
- **Kajabi**
- **Teachable**

---

## Types of GenAI Models

---

- **Variational Autoencoders (VAEs):** Generate new data by learning the underlying distribution of input data, useful for image and text generation.
- **Generative Adversarial Networks (GANs):** Consist of two neural networks (generator and discriminator) that compete to produce realistic data, widely used for image synthesis and enhancement.
- **Transformer Models:** Utilize self-attention mechanisms to generate coherent and contextually relevant text, such as GPT-3 and BERT.

---

## Cheat Sheet

---

### Tools

| Description                | Tools                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI/CD using AI             | Jenkins,IBM Watson Studio, Codefresh, Atlassian, GitLab CI/CD, PagerDuty AIOps, CircleCI, Travis CI, Harness, Snyk, Dynatrace's Davis AI              |
| Software Security using AI | Qwiet AI preZero, Snyk Code, GitHub Advanced Security, Veracode Fix, Endor Labs, Microsoft Security Copilot, BurpGPT, EscalateGPT                     |
| Documentation using AI     | Doxygen, NaturalDocs, Mintlify, DocuWriter.ai                                                                                                         |
| Code Reviews using AI      | DeepCode, CodeScene, Github Copilot, PullRequest.ai, CodeClimate, Snyk                                                                                |
| Innovation using AI        | Lumen5, Deep Nostalgia, Gen-1, Krisp, Legal Robot, Dall-E 2, Castle, Stable Diffusion 2, Soundraw, Lalal.ai, Cleanup.Pictures, Looka, Fireflies, Murf |
