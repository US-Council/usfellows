#!/usr/bin/env python3
"""Build each destination page from its own long-form editorial composition."""

from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent.parent

ICONS = ["compass", "institution", "lightbulb-o", "handshake-o"]

CATEGORY = {
    "mission": {
        "label": "Mission in practice",
        "facts": [("Orientation", "Public benefit before prestige"), ("Method", "Mission, institution, and contribution"), ("Horizon", "Enduring value beyond one appointment")],
        "principles": [("Purpose", "Begin with a consequential public need and define whom the work is intended to serve."), ("Rigor", "Join ambition to evidence, capable institutions, and work that can withstand scrutiny."), ("Stewardship", "Protect trust, learn from experience, and leave institutions stronger than they were found.")],
        "process_title": "How purpose becomes practice",
        "process_intro": "The Society translates broad purpose into work that can be understood, supported, and evaluated.",
        "steps": [("Name the need", "Define the public-interest challenge, its context, and the people or systems affected."), ("Shape the contribution", "Set a bounded role with clear responsibilities, useful outputs, and realistic scope."), ("Support the work", "Provide institutional context, supervision, access, and the conditions required for quality."), ("Carry learning forward", "Document outcomes and lessons so one contribution can strengthen the next.")],
        "quote": "Service earns its distinction through the quality of the contribution and the trust it keeps.",
        "related": [("mission.html", "Mission overview"), ("us-fellows-standard.html", "The US Fellows Standard"), ("fellowships.html", "Explore fellowships")],
        "cta": ("Put purpose into practice", "Explore a fellowship pathway or begin an expression of interest centered on the contribution you are prepared to make.", "apply.html", "Begin an application", "fellowships.html", "Explore fellowships"),
    },
    "fellowship": {
        "label": "The fellowship pathway",
        "facts": [("Foundation", "Merit, character, and public purpose"), ("Structure", "Fellow, mission, host, contribution"), ("Expectation", "Serious work with accountable support")],
        "principles": [("Field alignment", "A Fellow's knowledge and capabilities should be relevant to the work the appointment requires."), ("Institutional fit", "The host setting should make the contribution feasible, responsible, and useful."), ("Public value", "The appointment should create benefit beyond private career advancement or organizational convenience.")],
        "process_title": "From interest to appointment",
        "process_intro": "Appointments are shaped deliberately so that recognition, institutional affiliation, and useful work reinforce one another.",
        "steps": [("Express interest", "Describe your record, field, mission interests, and the contribution you are ready to make."), ("Establish fit", "Consider merit, readiness, mission alignment, and the setting in which the work can succeed."), ("Define the appointment", "Confirm scope, host support, responsibilities, intended benefit, and a practical working cadence."), ("Serve and reflect", "Complete the work with rigor, participate in Society life, and share transferable learning.")],
        "quote": "A fellowship is not only recognition of a record; it is a commitment to make that record useful.",
        "related": [("fellowship-programs.html", "Fellowship programs"), ("selection-criteria.html", "Selection criteria"), ("fellow-benefits.html", "The Fellow experience")],
        "cta": ("Find the pathway that fits your contribution", "Review the programs, prepare a clear account of your capabilities and purpose, and tell the Society where you are ready to serve.", "apply.html", "Become a Fellow", "fellowship-programs.html", "View programs"),
    },
    "society": {
        "label": "Life in the Society",
        "facts": [("Community", "Cross-disciplinary and intergenerational"), ("Practice", "Exchange, mentorship, and service"), ("Continuity", "A civic identity beyond one role")],
        "principles": [("Belonging with purpose", "Society life creates connection around shared obligations, not status alone."), ("Exchange across fields", "Fellows learn from people whose disciplines, regions, and experiences differ from their own."), ("A lasting standard", "The Code of Service continues to guide conduct beyond a single cohort or appointment.")],
        "process_title": "How the Society stays active",
        "process_intro": "The Society is sustained through recurring practices that turn affiliation into useful relationships and continued service.",
        "steps": [("Welcome", "Orient Fellows to the standard, one another, and the missions that organize the Society's work."), ("Connect", "Build trusted peer, advisor, host, and alumni relationships across disciplines and places."), ("Convene", "Create serious forums for learning, collaboration, reflection, and recognition of contribution."), ("Continue", "Carry fellowship forward through mentorship, public-interest work, and future Society missions.")],
        "quote": "Belonging matters most when it enlarges what people are prepared to contribute together.",
        "related": [("society.html", "The Society"), ("code-of-service.html", "Code of Service"), ("convenings-honors.html", "Convenings and honors")],
        "cta": ("Take part in a society built for service", "Become a Fellow, nominate someone whose work deserves recognition, or help create the institutional settings where contribution can grow.", "apply.html", "Participate", "nominate-a-fellow.html", "Nominate a Fellow"),
    },
    "host": {
        "label": "For Host Institutions",
        "facts": [("Eligible settings", "Mission-driven institutions"), ("Host role", "Define, support, and supervise"), ("Standard", "Clarity, safety, respect, and public benefit")],
        "principles": [("A credible need", "The opportunity should respond to real institutional or public-interest work rather than create an ornamental role."), ("Responsible support", "A Fellow needs a designated supervisor, appropriate access, timely feedback, and a safe working setting."), ("Mutual value", "The appointment should respect the Fellow's capabilities while producing useful value for the mission and institution.")],
        "process_title": "Building a strong host relationship",
        "process_intro": "Good appointments begin before a Fellow arrives. Hosts clarify the work, establish support, and agree on what responsible completion looks like.",
        "steps": [("Propose", "Describe the mission, institutional need, likely work, intended benefit, and responsible owner."), ("Qualify", "Confirm organizational standing, supervision, resources, role clarity, and alignment with Society standards."), ("Match and shape", "Align the opportunity with a Fellow's capabilities and turn it into a realistic appointment plan."), ("Support and close", "Provide feedback throughout the work, review outcomes, and capture lessons at completion.")],
        "quote": "A Host Institution does more than offer a place to work; it creates the conditions for responsible contribution.",
        "related": [("host-institutions.html", "Host overview"), ("host-standards.html", "Host standards"), ("appointment-model.html", "Appointment model")],
        "cta": ("Create an opportunity for consequential service", "Bring forward a defined institutional need and the support required for a Fellow to address it responsibly.", "submit-opportunity.html", "Submit an opportunity", "become-a-host.html", "Become a Host"),
    },
    "missions": {
        "label": "A humanity-scale mission",
        "facts": [("Scale", "Enduring public consequence"), ("Approach", "Cross-disciplinary contribution"), ("Measure", "Useful work and stronger institutions")],
        "principles": [("Listen before acting", "Understand existing knowledge, lived experience, and institutional context before defining a response."), ("Work across boundaries", "Bring disciplines and sectors together when no single profession can address the whole challenge."), ("Build durable capacity", "Favor work that strengthens people, knowledge, and systems beyond the immediate intervention.")],
        "process_title": "From a large mission to useful work",
        "process_intro": "Humanity-scale language must lead to specific contribution. Each appointment narrows a broad challenge into work a Fellow and host can pursue responsibly.",
        "steps": [("Understand the field", "Map the challenge, affected communities, existing efforts, evidence, and important constraints."), ("Locate leverage", "Identify a bounded question or institutional need where the Fellow's capabilities can matter."), ("Contribute with discipline", "Work through a trusted host, respect domain knowledge, and produce useful, reviewable outputs."), ("Strengthen what endures", "Share learning and reinforce the relationships, knowledge, and systems that carry the mission forward.")],
        "quote": "Humanity-scale service becomes credible one well-defined, well-supported contribution at a time.",
        "related": [("missions.html", "All missions"), ("mission-fellowships.html", "Mission Fellowships"), ("fellowship-programs.html", "Fellowship programs")],
        "cta": ("Bring your discipline to a mission that matters", "Explore how your knowledge can support public-interest work through a qualified institution and a defined fellowship contribution.", "apply.html", "Express interest", "missions.html", "Explore all missions"),
    },
    "fellows": {
        "label": "Becoming a Fellow",
        "facts": [("Who is considered", "Exceptional people across fields"), ("What matters", "Excellence, integrity, and readiness"), ("What follows", "A supported public-interest contribution")],
        "principles": [("A record with substance", "Accomplishment may take many forms, but it should demonstrate capability, judgment, and sustained effort."), ("Character under responsibility", "Fellows are trusted with institutional relationships, communities, and the public meaning of the Society."), ("Readiness to contribute", "Candidates should be able to explain what they can do, where it is relevant, and how they will approach service.")],
        "process_title": "What the selection journey asks of you",
        "process_intro": "The process is designed to understand the whole candidate: record, character, field, mission, and the practical contribution they are equipped to make.",
        "steps": [("Prepare", "Gather a clear account of your work, capabilities, service, mission interests, and current readiness."), ("Apply or be nominated", "Submit an expression of interest directly or through someone able to speak to your record and character."), ("Review and conversation", "The Society considers evidence, alignment, references where appropriate, and the conditions for a sound appointment."), ("Appointment", "Selected Fellows confirm expectations, host or project context, responsibilities, and the Code of Service.")],
        "quote": "The strongest candidates can connect what they have accomplished to what they are prepared to contribute next.",
        "related": [("fellows.html", "Fellow overview"), ("eligibility.html", "Eligibility"), ("selection-criteria.html", "Selection criteria")],
        "cta": ("Prepare a serious expression of interest", "Tell us what you have learned, what you can contribute, and which public missions call for your abilities now.", "apply.html", "Apply to become a Fellow", "nominate-a-fellow.html", "Nominate someone"),
    },
    "journal": {
        "label": "The Journal",
        "facts": [("Purpose", "Make knowledge useful"), ("Sources", "Research, practice, and reflection"), ("Standard", "Clarity, evidence, and public value")],
        "principles": [("Earn the reader's trust", "Distinguish observation, evidence, interpretation, and recommendation with care."), ("Write from substance", "Ground contributions in credible inquiry, direct practice, or a clearly articulated argument."), ("Serve a larger conversation", "Help Fellows, institutions, and the public understand a mission or act on it more responsibly.")],
        "process_title": "From experience to a useful contribution",
        "process_intro": "Journal work is shaped to preserve rigor while remaining accessible to people working across different disciplines and institutions.",
        "steps": [("Frame", "Identify the question, audience, relevance, and form best suited to the material."), ("Develop", "Gather evidence, context, field insight, and competing perspectives with appropriate care."), ("Review", "Clarify claims, limitations, permissions, confidentiality, and the practical value of publication."), ("Publish and extend", "Share the work and use it to support discussion, learning, and future inquiry across the Society.")],
        "quote": "The Journal exists not simply to record activity, but to make hard-won knowledge available for further service.",
        "related": [("journal.html", "Journal overview"), ("essays-research-notes.html", "Essays and research notes"), ("field-reports.html", "Field reports")],
        "cta": ("Contribute to the Society's public record", "Bring forward a grounded idea, field lesson, research note, or institutional question that can help others serve more effectively.", "apply.html", "Contact the Society", "journal.html", "Explore the Journal"),
    },
}

PAGES = {
    # Mission and institutional purpose
    "our-mission.html": ("mission", "A framework for service of public consequence", "The mission is intentionally broad enough to welcome excellence from many fields and disciplined enough to require a real public-interest contribution.", "US Fellows joins recognition to responsibility. Every affiliation should connect a capable person, a consequential mission, a trusted setting, and work that can be described plainly.", [("Recognize capability", "Honor people whose work demonstrates substance, judgment, and the potential for further service."), ("Connect talent to mission", "Help exceptional people locate institutions and problems where their abilities are genuinely relevant."), ("Structure contribution", "Turn goodwill into a defined appointment with purpose, scope, support, and useful outputs."), ("Sustain civic identity", "Create relationships and obligations that endure beyond a single project or period of service.")]),
    "vision.html": ("mission", "A stronger civic culture of contribution", "The long view is a society in which exceptional ability carries a visible expectation of service and public-interest institutions can reach the talent they need.", "That future depends on durable relationships across disciplines, generations, regions, and institutions—not occasional acts of goodwill alone.", [("Talent can find purpose", "People in every field can see a credible route from professional excellence to public contribution."), ("Institutions can find capability", "Mission-driven organizations can engage Fellows whose knowledge fits consequential work."), ("Service can be honored", "Public recognition elevates serious contribution and encourages others to accept responsibility."), ("Learning can compound", "Cohorts, alumni, hosts, and the Journal carry lessons from one mission into the next.")]),
    "why-us-fellows.html": ("mission", "The missing civic pathway", "Many capable people want their work to matter beyond private success, while mission-driven institutions face needs that exceed their immediate capacity.", "US Fellows creates connective civic infrastructure: a recognized identity, a standard of conduct, an institutional appointment model, and a community oriented toward service.", [("Fragmented opportunity", "Public-interest roles are often difficult to discover, compare, or enter across institutional boundaries."), ("Underused expertise", "Experienced professionals and emerging leaders may lack a credible bridge into mission-centered work."), ("Institutional constraints", "Hosts need defined roles and responsible support, not an open-ended promise of volunteer talent."), ("Continuity after service", "A Society allows relationships, learning, and civic identity to persist after one appointment ends.")]),
    "us-fellows-standard.html": ("mission", "The standard behind the distinction", "Selection recognizes accomplishment, but the meaning of fellowship rests equally on character, discipline, public purpose, and conduct after appointment.", "The standard protects Fellows, hosts, communities, and the credibility of the Society by making expectations visible from the beginning.", [("Excellence", "Bring demonstrated capability and a willingness to keep learning where the mission demands it."), ("Integrity", "Represent work honestly, disclose limitations, honor commitments, and protect entrusted information."), ("Humility", "Respect communities, colleagues, host knowledge, and the difference between expertise and omniscience."), ("Responsibility", "Use fellowship recognition to strengthen the work, the institution, and the public good.")]),
    "governance-stewardship.html": ("mission", "Accountability that protects the fellowship", "Governance establishes how standards are maintained, appointments are reviewed, conflicts are addressed, and long-term institutional integrity is protected.", "Stewardship is designed to preserve the meaning of the Society without making it rigid. Policies and decisions should remain responsive to evidence, mission context, and the people affected by the work.", [("Standards stewardship", "Maintain clear expectations for selection, appointment quality, conduct, and public representation."), ("Appointment oversight", "Review host fit, mission alignment, role clarity, and appropriate support before affiliation."), ("Responsible escalation", "Provide channels for concerns, conflicts, safeguarding, and questions about Society standards."), ("Long-term direction", "Protect the public-benefit purpose and institutional continuity of the fellowship across cohorts.")]),

    # Fellowship pathways
    "fellowship-programs.html": ("fellowship", "Ten programs, one fellowship standard", "Programs organize the Society by field and form of contribution while preserving a shared expectation of excellence, integrity, and service.", "A program name signals the mission context; the actual appointment is still shaped around the Fellow's capabilities, the host's need, and a defined public benefit.", [("Humanity, Civic, and Education", "Service involving dignity, public trust, community strength, learning, mentorship, and opportunity."), ("Science, Earth, and Innovation", "Research, discovery, stewardship, public-interest technology, and responsible solution-building."), ("Graduate and National Capacity", "Field-aligned appointments and expertise applied to resilient institutions and critical public systems."), ("Senior and Distinguished", "Experienced leaders whose contribution may include advising, convening, mentoring, and major missions.")]),
    "career-advancement.html": ("fellowship", "Professional growth aligned with public purpose", "The Career Advancement Track helps graduates and emerging professionals build field-relevant experience through work that also serves an institutional or public need.", "It is not generic placement. A sound appointment connects academic preparation, professional direction, host capacity, and a contribution with defined value.", [("Field relevance", "The work should use or deepen knowledge connected to the Fellow's education and intended profession."), ("Substantive scope", "Responsibilities should produce credible experience and useful outputs, not observation alone."), ("Supported development", "Hosts provide context, supervision, feedback, and exposure to responsible professional practice."), ("Public-interest setting", "Growth occurs through research, civic, educational, scientific, humanitarian, or mission-driven work.")]),
    "international-graduate-fellows.html": ("fellowship", "Global perspective, field-aligned contribution", "International graduates bring academic knowledge, cultural perspective, and connections across institutions and countries to American public-interest work.", "Appointments are selected on merit and mission fit. They must remain grounded in a qualified host, clear responsibilities, and any independent legal or institutional requirements that apply.", [("Academic alignment", "Connect advanced study to research, analysis, education, innovation, or other substantive field work."), ("Institutional contribution", "Address a real need with outputs and responsibilities appropriate to the Fellow's preparation."), ("Cross-cultural insight", "Strengthen collaboration and understanding without reducing a Fellow to nationality or background."), ("Responsible participation", "Keep fellowship selection distinct from immigration, employment, licensing, or academic authorization decisions.")]),
    "national-capacity-fellows.html": ("fellowship", "Expertise in service to resilient systems", "National Capacity Fellows apply technical, operational, scientific, and institutional knowledge to systems on which public wellbeing depends.", "The pathway is suited to professionals who can pair domain competence with respect for institutional realities, public trust, and long-term readiness.", [("Infrastructure", "Support the reliability, modernization, and responsible management of essential physical systems."), ("Cybersecurity and technology", "Improve digital resilience, security practice, public-interest technology, and institutional preparedness."), ("Emergency readiness", "Strengthen planning, coordination, continuity, risk analysis, and learning before and after crises."), ("Scientific and public systems", "Build the knowledge, workforce, operations, and governance needed for durable national capability.")]),
    "mission-fellowships.html": ("fellowship", "Appointments that begin with a consequential need", "Mission Fellowships are organized around a defined public-interest challenge rather than a conventional job category or a single professional discipline.", "They are especially useful when the work requires cross-disciplinary thinking, a bounded project, or focused capacity inside a mission-driven institution.", [("Research and synthesis", "Clarify a question, gather evidence, map a field, or translate knowledge for institutional use."), ("Civic and institutional innovation", "Design or test practical improvements to access, services, operations, or public engagement."), ("Advisory contribution", "Bring experienced judgment to strategy, governance, technical questions, or mission development."), ("Field-based service", "Support implementation, partnership, education, documentation, or learning close to the work itself.")]),

    # Society
    "fellowship-society.html": ("society", "A civic home across disciplines and generations", "The Society connects people who may work in different fields but share a commitment to integrity, public purpose, and contribution beyond self.", "Its value grows over time: relationships formed around one cohort can become future mentorship, collaboration, host partnerships, scholarship, and renewed service.", [("Fellows and alumni", "Carry the standard through appointments, professional life, mentorship, and later Society missions."), ("Advisors", "Offer domain knowledge, judgment, introductions, and guidance without displacing accountable leadership."), ("Host Institutions", "Anchor fellowship in real work and connect the Society to active public-interest needs."), ("Mission partners", "Extend reach, context, and collaboration across communities, disciplines, and institutions.")]),
    "cohorts-chapters.html": ("society", "Community at the scale of relationship and place", "Cohorts give Fellows a shared beginning; chapters create continuity around a region, institution, or mission where sustained relationships can support public work.", "These structures should remain useful and light enough to serve Fellows rather than becoming ends in themselves.", [("Cohort formation", "Create a trusted peer group for orientation, reflection, exchange, and mutual accountability."), ("Regional connection", "Bring Fellows and institutions together around local knowledge, needs, and opportunities for service."), ("Mission circles", "Convene across geography when a field or public challenge benefits from sustained specialist exchange."), ("Alumni continuity", "Maintain relationships through mentorship, referrals, chapter leadership, and renewed contribution.")]),
    "convenings-honors.html": ("society", "Gathering for learning, recognition, and common purpose", "Convenings create focused time for Fellows, hosts, advisors, and partners to examine missions, share practice, and form relationships across fields.", "Honors recognize work of real consequence while keeping attention on the mission, the collaborators, and the responsibilities that accompany distinction.", [("Mission forums", "Bring evidence, field experience, and different disciplines to a consequential public question."), ("Fellow exchanges", "Create candid spaces to compare methods, challenges, decisions, and lessons from appointments."), ("Public recognition", "Elevate contribution that exemplifies excellence, integrity, and meaningful public benefit."), ("Institutional connection", "Help hosts and partners discover shared needs, complementary strengths, and future collaboration.")]),
    "code-of-service.html": ("society", "Conduct worthy of public trust", "The Code of Service turns the Society's values into expectations for how Fellows approach institutions, communities, colleagues, knowledge, and recognition.", "It applies in public and private conduct connected to fellowship and provides a common reference when circumstances are difficult or ambiguous.", [("Serve with integrity", "Represent qualifications, evidence, affiliations, progress, and outcomes honestly."), ("Respect people and institutions", "Honor dignity, consent, confidentiality, local knowledge, and responsible organizational processes."), ("Practice disciplined humility", "Ask before assuming, acknowledge limits, accept feedback, and correct errors promptly."), ("Use recognition responsibly", "Do not imply endorsement beyond an appointment or place personal visibility above the mission.")]),
    "fellowship-oath.html": ("society", "A public promise of responsibility", "The Fellowship Oath is a concise expression of the obligations that give recognition its meaning: integrity, humility, service, and responsibility to future generations.", "The oath is not a substitute for detailed standards. It is a durable reminder of why those standards matter and how a Fellow chooses to carry the distinction.", [("Accept the honor", "Receive fellowship with gratitude and an understanding that distinction creates responsibility."), ("Commit to service", "Direct knowledge, talent, and imagination toward humanity, civil society, science, and the nation."), ("Uphold the Society", "Act in ways that protect trust among Fellows, hosts, communities, and the public."), ("Serve the future", "Consider the long consequences of decisions and help others inherit stronger institutions and possibilities.")]),

    # Host pathway
    "become-a-host.html": ("host", "Bring capable people into work that matters", "Host Institutions turn mission into a setting where a Fellow can contribute with context, supervision, access, and accountable purpose.", "The strongest proposals begin with a real need rather than a generic request for talent. They explain why the work matters, what success would make possible, and who will support it.", [("Define the need", "Identify the institutional challenge, public context, and why a fellowship contribution is appropriate now."), ("Name the work", "Describe core responsibilities, expected outputs, working relationships, and realistic boundaries."), ("Provide support", "Assign a responsible supervisor and ensure access to the people, information, tools, and feedback required."), ("Plan for value", "Clarify how the institution will use the work and what the Fellow should learn or carry forward.")]),
    "who-can-host.html": ("host", "Mission-driven institutions prepared to support a Fellow", "Eligible hosts include nonprofits, research institutes, universities, civic institutions, public-interest organizations, and other approved entities with credible missions.", "Institutional type alone is not sufficient. Qualification depends on the proposed work, organizational standing, supervision, safeguards, and capacity to uphold Society standards.", [("Nonprofits and NGOs", "Humanitarian, environmental, educational, community, cultural, and public-interest organizations."), ("Research and higher education", "Institutes, laboratories, centers, universities, and field programs with suitable oversight."), ("Civic institutions", "Organizations advancing public administration, access, resilience, policy, law, or community capacity."), ("Mission-driven entities", "Approved institutions able to demonstrate public purpose, responsible governance, and a credible opportunity.")]),
    "host-standards.html": ("host", "The conditions responsible contribution requires", "Host standards protect the Fellow, the institution, affected communities, and the credibility of the appointment.", "They establish a baseline while allowing the working model to fit different fields, from research and advisory projects to civic, educational, and field-based service.", [("Role clarity", "Provide a written purpose, responsibilities, outputs, duration, working relationships, and known constraints."), ("Designated supervision", "Name a person with the authority, availability, and subject context to guide and review the work."), ("Safe and respectful setting", "Maintain appropriate policies, safeguarding, accessibility, and routes for raising concerns."), ("Responsible closeout", "Review work, address entrusted materials, recognize contribution accurately, and report material issues.")]),
    "appointment-model.html": ("host", "A shared structure for accountable contribution", "The appointment model aligns four elements: a selected Fellow, a humanity-scale mission, a qualified host, and a defined contribution.", "Clarity across those elements prevents fellowship from becoming an honorary label on one side or an unsupported work request on the other.", [("The Fellow", "Brings relevant capability, character, readiness, and commitment to the Code of Service."), ("The mission", "Provides the public-interest reason for the appointment and the larger outcome it seeks to advance."), ("The host", "Provides institutional setting, supervision, context, access, and responsibility for the opportunity."), ("The contribution", "Defines the work, outputs, boundaries, learning, and intended benefit in practical terms.")]),
    "submit-opportunity.html": ("host", "Turn an institutional need into a credible proposal", "A mission opportunity should give reviewers and prospective Fellows enough context to understand the purpose, work, support, and intended public benefit.", "Early proposals do not need every operational detail, but they should demonstrate that the institution has a real owner for the work and is prepared to shape it responsibly.", [("Mission and context", "Explain the public-interest issue, institutional role, affected people or systems, and relevant existing work."), ("Contribution", "Describe what the Fellow would do, likely outputs, needed capabilities, timeframe, and boundaries."), ("Supervision and resources", "Name the responsible lead and identify access, tools, collaborators, funding, or facilities available."), ("Outcomes and learning", "State how the work will be used, reviewed, and documented without making unsupported impact claims.")]),

    # Humanity-scale missions
    "humanity-dignity.html": ("missions", "Dignity as both purpose and method", "Work in this mission begins with the inherent worth, agency, and knowledge of every person—not a view of communities as passive recipients of help.", "Fellows may contribute through humanitarian, health, access, poverty, migration, rights, community, and human-flourishing initiatives led by credible institutions.", [("Humanitarian service", "Support responsible relief, recovery, coordination, protection, and locally grounded capacity."), ("Health and wellbeing", "Advance access, public health, care systems, prevention, communication, and human security."), ("Access and opportunity", "Address barriers to services, rights, education, participation, mobility, and economic possibility."), ("Community strength", "Support civil society, trusted local institutions, inclusion, belonging, and long-term human flourishing.")]),
    "science-discovery.html": ("missions", "Inquiry in service to understanding and public benefit", "Science Fellows advance knowledge while respecting the methods, uncertainty, ethics, and collaborative institutions on which credible discovery depends.", "Contributions may occur at the frontier of research or in the essential work of synthesis, infrastructure, communication, translation, and public understanding.", [("Research and discovery", "Support well-framed questions, rigorous methods, analysis, replication, and new knowledge."), ("Scientific capacity", "Strengthen data, laboratories, research operations, open tools, workforce, and institutional systems."), ("Translation and communication", "Make evidence understandable and useful without overstating certainty or erasing important limits."), ("Science in public life", "Help institutions and communities use evidence responsibly in decisions of public consequence.")]),
    "planetary-stewardship.html": ("missions", "Responsibility to the living systems we share", "Planetary stewardship connects climate, biodiversity, conservation, environmental justice, land and water, sustainable systems, and resilience.", "The mission requires scientific seriousness and attention to the human institutions, livelihoods, histories, and unequal burdens involved in environmental change.", [("Climate resilience", "Support adaptation, risk understanding, preparedness, mitigation, and community-centered resilience."), ("Conservation and biodiversity", "Protect habitats, species, ecological knowledge, and the systems required for long-term recovery."), ("Environmental justice", "Center communities that bear disproportionate risk and respect their knowledge, rights, and priorities."), ("Sustainable institutions", "Improve how organizations manage energy, materials, water, land, procurement, and long-horizon decisions.")]),
    "civic-life-public-trust.html": ("missions", "Institutions worthy of participation and trust", "Public trust is strengthened through competence, transparency, fairness, access, lawful conduct, and meaningful ways for people to participate.", "Fellows can support the practical work of civic institutions without requiring partisan uniformity or treating trust as a communications problem alone.", [("Public access", "Improve the clarity, usability, language access, and reach of civic information and services."), ("Institutional capacity", "Strengthen operations, policy implementation, evaluation, legal access, and responsible administration."), ("Civic participation", "Support informed engagement, community partnership, deliberation, and pathways into public life."), ("Trustworthy information", "Advance evidence, public understanding, transparency, and resilience against confusion and manipulation.")]),
    "national-capacity-resilience.html": ("missions", "Systems prepared to carry public responsibility", "National capacity is the accumulated ability of institutions, infrastructure, people, knowledge, and networks to meet essential needs and adapt under pressure.", "Resilience is not only emergency response. It includes maintenance, foresight, workforce, coordination, learning, and trustworthy systems before a crisis arrives.", [("Critical infrastructure", "Support reliable physical, digital, logistical, energy, water, and communications systems."), ("Preparedness and continuity", "Improve risk analysis, scenario planning, exercises, coordination, recovery, and institutional learning."), ("Cyber and digital resilience", "Protect essential services, strengthen security practice, and design technology for dependable public use."), ("Knowledge and workforce", "Build scientific, technical, operational, and leadership capability for long-term readiness.")]),

    # Fellow experience
    "become-a-fellow.html": ("fellows", "Fellowship begins with a contribution you can name", "The Society welcomes accomplished professionals, emerging leaders, researchers, builders, educators, public servants, and others prepared for mission-aligned work.", "A strong expression of interest is specific about both record and readiness: what you know, what you have done, where you want to serve, and what you can responsibly undertake now.", [("Clarify your mission", "Identify the public questions and communities to which you can bring sustained, informed commitment."), ("Describe your capabilities", "Use concrete evidence from work, research, leadership, creative practice, or service."), ("Propose your contribution", "Explain the kind of project, affiliation, research, advising, or institutional work you could pursue."), ("Show readiness", "Address availability, collaboration, learning, ethical responsibility, and the support your work would require.")]),
    "eligibility.html": ("fellows", "Excellence can emerge from any field", "There is no single profession, career stage, geography, or academic pathway that defines a US Fellow.", "Eligibility is broad by design, but selection is discerning. Candidates must show credible ability, integrity, mission relevance, and readiness for a structured public-interest affiliation.", [("Professionals and practitioners", "People with demonstrated capability in their field and a serious desire to direct it toward public purpose."), ("Researchers and scholars", "Individuals able to advance, translate, or apply knowledge within a mission and host context."), ("Graduates and emerging leaders", "Candidates with strong preparation, promise, judgment, and readiness for field-aligned contribution."), ("Senior and distinguished leaders", "Experienced people prepared to advise, mentor, convene, or lead work of major public consequence.")]),
    "selection-criteria.html": ("fellows", "A whole-person assessment of merit and purpose", "Selection considers accomplishment in context. Reviewers look for evidence of what a candidate can do, how they exercise responsibility, and why a particular mission or appointment makes sense.", "No single credential substitutes for the full standard, and potential may be considered alongside an established record where evidence supports it.", [("Excellence and capability", "Quality of work, depth of knowledge, disciplined execution, creativity, leadership, or demonstrated promise."), ("Integrity and character", "Honesty, judgment, respect, accountability, humility, and conduct consistent with public trust."), ("Service and mission alignment", "A credible relationship between the candidate's record, stated purpose, and the mission they seek to advance."), ("Contribution potential", "Readiness, collaboration, field fit, and the likelihood of producing useful work in a qualified setting.")]),
    "fellow-benefits.html": ("fellows", "Recognition, affiliation, and a platform for service", "Fellowship offers a distinguished civic identity and access to relationships, institutions, and opportunities organized around meaningful contribution.", "Benefits vary with the program and appointment. They do not imply an employment relationship, financial support, academic credit, or a guaranteed appointment unless explicitly established separately.", [("Fellowship identity", "Recognition grounded in a selective standard of excellence, character, and public purpose."), ("Mission and host affiliation", "A structured connection to relevant work, institutional context, and a defined contribution."), ("Cohort and Society life", "Peer exchange, convenings, mentorship, cross-disciplinary relationships, and alumni continuity."), ("A record of contribution", "Opportunities to document learning, share field insight, publish, advise, and pursue future missions.")]),
    "nominate-a-fellow.html": ("fellows", "Bring exceptional people to the Society's attention", "Nominations help identify people whose records may not fit conventional pipelines but whose work, character, and potential deserve serious consideration.", "A nomination is strongest when it goes beyond admiration and provides specific evidence of excellence, integrity, mission alignment, and readiness to contribute.", [("Identify the person", "Provide accurate professional context, your relationship to the nominee, and how they may be contacted."), ("Describe the record", "Point to consequential work, leadership, research, service, creative contribution, or demonstrated promise."), ("Speak to character", "Offer examples of judgment, integrity, humility, collaboration, and responsibility under real conditions."), ("Connect to mission", "Explain where the nominee's capabilities could serve and what kind of contribution they may be prepared to make.")]),

    # Journal
    "essays-research-notes.html": ("journal", "Ideas developed with rigor and public purpose", "Essays make room for sustained argument and reflection; research notes make a focused question, method, finding, or emerging line of inquiry available sooner.", "Both forms should make their basis visible and help readers understand not only what the author thinks, but why the idea matters and where its limits lie.", [("Essays", "Develop an argument or reflection on service, institutions, science, dignity, civic life, or national purpose."), ("Research notes", "Share a focused finding, method, dataset, question, literature insight, or work in progress."), ("Public-benefit analysis", "Connect evidence and interpretation to decisions or questions facing mission-driven institutions."), ("Cross-disciplinary exchange", "Translate field knowledge so readers outside the specialty can engage it responsibly.")]),
    "field-reports.html": ("journal", "Practice documented for those who follow", "Field Reports turn direct experience into transferable knowledge without pretending that one setting or project yields universal rules.", "A strong report names the context, choices, constraints, observations, and uncertainties that readers need in order to judge what may apply elsewhere.", [("Context and purpose", "Describe the setting, mission, partners, affected communities, and question that shaped the work."), ("Methods and decisions", "Explain what was tried, why choices were made, and how the work changed as understanding grew."), ("Results and limits", "Report credible outcomes, unresolved issues, failures, tradeoffs, and what cannot yet be known."), ("Lessons for practice", "Offer grounded considerations for future Fellows and institutions without overclaiming certainty.")]),
    "fellow-stories.html": ("journal", "Profiles centered on contribution", "Fellow Stories introduce the people of the Society through the missions they serve, the capabilities they bring, and the relationships that make the work possible.", "Profiles avoid hero narratives that erase institutions or communities. They show character through choices, collaboration, learning, and the substance of contribution.", [("The path to service", "Trace the experiences, questions, and commitments that brought the Fellow to the mission."), ("The work itself", "Explain the appointment, host context, responsibilities, collaborators, and intended public value."), ("Learning and judgment", "Explore decisions, surprises, limits, and how the Fellow's understanding changed through practice."), ("What continues", "Show how relationships, knowledge, and responsibility extend beyond one formal appointment.")]),
    "institutional-briefings.html": ("journal", "Focused knowledge for consequential decisions", "Institutional Briefings synthesize a defined question for leaders, hosts, advisors, and partners who need clarity without false simplicity.", "They are designed for use: concise enough to engage, rigorous enough to trust, and explicit about assumptions, uncertainty, and implications.", [("The decision context", "State the institutional question, audience, timeframe, stakes, and why attention is needed."), ("Evidence and landscape", "Summarize relevant knowledge, actors, approaches, constraints, and points of disagreement."), ("Implications", "Explain what the evidence may mean for policy, practice, partnership, capacity, or further inquiry."), ("Options and cautions", "Offer practical considerations while distinguishing analysis from formal institutional advice.")]),
    "impact-reports.html": ("journal", "A disciplined account of contribution and learning", "Impact reporting helps the Society examine whether appointments produce useful work, strengthen institutions, and advance public-benefit missions.", "Not every result can be reduced to one metric. Credible reporting combines proportionate evidence with context, limitations, stakeholder perspective, and attention to longer-term capacity.", [("Contribution delivered", "Document outputs, responsibilities completed, quality, reach, and how the work was used."), ("Institutional value", "Examine capability, relationships, knowledge, or systems strengthened through the appointment."), ("Mission progress", "Connect near-term results to the larger public-interest purpose without claiming sole attribution."), ("Learning and accountability", "Name challenges, unintended effects, feedback, corrections, and priorities for future work.")]),
}


# Each destination has a deliberately authored composition. The tuple is:
# hero, section order, overview, focus, principles, process, close, navigation.
# Components repeat where their semantics fit, but no complete recipe repeats.
DESIGNS = {
    "our-mission.html": ("declaration", "opfx", "statement", "bands", "manifesto", "path", "banner", "none"),
    "vision.html": ("horizon", "ofxp", "centered", "orbit", "pillars", "milestones", "quote", "none"),
    "why-us-fellows.html": ("light-brief", "opfx", "brief", "bento", "sidebar", "ledger", "split", "bar"),
    "us-fellows-standard.html": ("seal", "pofx", "dossier", "table", "checklist", "vertical", "inset", "index"),
    "governance-stewardship.html": ("side-number", "oxpf", "index", "ledger", "rows", "ledger", "compact", "rail"),
    "fellowship-programs.html": ("diagonal", "fopx", "editorial", "mosaic", "cards", "steps", "standard", "bar"),
    "career-advancement.html": ("portrait", "ofxp", "portrait", "cards", "rows", "path", "quote", "bar"),
    "international-graduate-fellows.html": ("letterbox", "oxfp", "letter", "table", "checklist", "milestones", "inset", "index"),
    "national-capacity-fellows.html": ("offset", "foxp", "split", "bento", "sidebar", "stair", "split", "rail"),
    "mission-fellowships.html": ("centered", "opxf", "statement", "chapters", "pillars", "timeline", "banner", "none"),
    "fellowship-society.html": ("declaration", "opfx", "statement", "mosaic", "rows", "milestones", "banner", "none"),
    "cohorts-chapters.html": ("panorama", "foxp", "split", "orbit", "pillars", "path", "standard", "bar"),
    "convenings-honors.html": ("blue-block", "ofpx", "portrait", "mosaic", "band", "milestones", "quote", "rail"),
    "code-of-service.html": ("red-rule", "poxf", "dossier", "ledger", "checklist", "vertical", "inset", "index"),
    "fellowship-oath.html": ("quiet", "opfx", "letter", "rail", "manifesto", "path", "compact", "none"),
    "become-a-host.html": ("image-right", "xofp", "index", "bento", "sidebar", "stair", "split", "bar"),
    "who-can-host.html": ("light-brief", "fopx", "brief", "table", "pillars", "steps", "standard", "rail"),
    "host-standards.html": ("seal", "pofx", "dossier", "ledger", "checklist", "ledger", "inset", "index"),
    "appointment-model.html": ("portrait", "oxfp", "portrait", "cards", "rows", "path", "quote", "bar"),
    "submit-opportunity.html": ("compact", "xopf", "letter", "table", "checklist", "milestones", "banner", "rail"),
    "humanity-dignity.html": ("centered", "ofpx", "centered", "chapters", "pillars", "timeline", "quote", "none"),
    "science-discovery.html": ("portrait", "fopx", "split", "mosaic", "sidebar", "steps", "split", "bar"),
    "planetary-stewardship.html": ("declaration", "opfx", "statement", "orbit", "manifesto", "milestones", "compact", "none"),
    "civic-life-public-trust.html": ("light-brief", "oxpf", "brief", "ledger", "cards", "ledger", "standard", "bar"),
    "national-capacity-resilience.html": ("diagonal", "fxop", "index", "bento", "pillars", "stair", "inset", "index"),
    "become-a-fellow.html": ("guide", "xofp", "dossier", "rail", "checklist", "vertical", "banner", "rail"),
    "eligibility.html": ("light-brief", "fopx", "index", "mosaic", "sidebar", "steps", "quote", "bar"),
    "selection-criteria.html": ("side-number", "poxf", "dossier", "ledger", "cards", "ledger", "split", "index"),
    "fellow-benefits.html": ("portrait", "ofxp", "split", "orbit", "band", "milestones", "compact", "bar"),
    "nominate-a-fellow.html": ("letterbox", "oxpf", "letter", "chapters", "checklist", "vertical", "banner", "rail"),
    "essays-research-notes.html": ("quiet", "ofpx", "centered", "mosaic", "sidebar", "path", "quote", "none"),
    "field-reports.html": ("guide", "xofp", "dossier", "ledger", "checklist", "milestones", "inset", "index"),
    "fellow-stories.html": ("image-right", "ofpx", "portrait", "cards", "rows", "path", "split", "bar"),
    "institutional-briefings.html": ("light-brief", "oxpf", "brief", "table", "pillars", "ledger", "standard", "rail"),
    "impact-reports.html": ("offset", "fxop", "index", "bento", "cards", "stair", "banner", "index"),
}

if set(DESIGNS) != set(PAGES):
    raise RuntimeError("Every generated destination must have exactly one design recipe.")
if len(set(DESIGNS.values())) != len(DESIGNS):
    raise RuntimeError("Destination design recipes must be unique.")


def _heading(eyebrow, title, text="", centered=False):
    cls = "section-intro section-intro--center" if centered else "section-intro"
    copy = f'<p>{html.escape(text)}</p>' if text else ""
    return f'<div class="{cls}"><span class="eyebrow">{eyebrow}</span><h2>{title}</h2><div class="rule"></div>{copy}</div>'


def _overview(style, c):
    intro = c["intro"]
    if style == "statement":
        return f'<section class="manifesto-opening" id="overview"><div class="container"><span class="eyebrow">{c["label"]}</span><p class="manifesto-statement">{c["lead"]}</p><div class="manifesto-detail"><h2>{c["heading"]}</h2><p>{c["detail"]}</p></div></div></section>'
    if style == "centered":
        return f'<section class="section narrative-opening" id="overview"><div class="container">{intro}<blockquote><p>“{c["lens"]}”</p></blockquote></div></section>'
    if style == "brief":
        return f'<section class="section brief-overview" id="overview"><div class="container"><div class="brief-heading">{intro}<span class="brief-mark" aria-hidden="true">USF / BRIEF</span></div><div class="fact-strip">{c["fact_strip"]}</div></div></section>'
    if style == "letter":
        return f'<section class="section letter-opening" id="overview"><div class="container"><div class="letter-meta"><span>US Fellows</span><strong>Service memorandum</strong><small>Subject / {c["heading"]}</small></div><div class="letter-copy">{intro}</div></div></section>'
    if style == "dossier":
        return f'<section class="section dossier-opening" id="overview"><div class="container editorial-grid">{intro}<aside class="guide-index"><span>Working dossier</span><h3>Questions to carry forward</h3><ul class="fact-list">{c["facts"]}</ul></aside></div></section>'
    if style == "split":
        return f'<section class="split-opening" id="overview"><div class="split-opening__copy">{intro}</div><div class="split-opening__visual"><span>01</span><p>{c["lens"]}</p></div></section>'
    if style == "index":
        return f'<section class="section index-opening" id="overview"><div class="container"><div class="index-number" aria-hidden="true">01</div>{intro}<aside><span class="eyebrow">At a glance</span><ul class="fact-list">{c["facts"]}</ul></aside></div></section>'
    if style == "portrait":
        return f'<section class="section profile-opening" id="overview"><div class="container profile-grid">{intro}<aside class="profile-emblem"><span>Perspective</span><strong>01</strong><p>{c["lens"]}</p></aside></div></section>'
    return f'<section class="section" id="overview"><div class="container editorial-grid">{intro}<aside class="fact-panel"><h3>This page at a glance</h3><ul class="fact-list">{c["facts"]}</ul></aside></div></section>'


def _focus(style, c):
    head = _heading("The substance", "Four dimensions of the work", c["lead"], style in {"mosaic", "orbit"})
    if style == "chapters":
        return f'<section class="narrative-focus" id="focus"><div class="container"><span class="eyebrow">The story of the work</span><h2>Four chapters of contribution</h2>{c["focus_items"]}</div></section>'
    if style == "bands":
        return f'<section class="focus-bands" id="focus"><div class="container">{head}</div><div class="focus-bands__grid">{c["focus_cards"]}</div></section>'
    if style == "orbit":
        return f'<section class="section section--mist" id="focus"><div class="container">{head}<div class="focus-orbit"><div class="focus-orbit__center"><span>One mission</span><strong>Four fields</strong></div>{c["focus_cards"]}</div></div></section>'
    if style == "ledger":
        return f'<section class="section section--mist" id="focus"><div class="container focus-ledger">{head}<div>{c["focus_items"]}</div></div></section>'
    if style == "table":
        return f'<section class="section" id="focus"><div class="container">{head}<div class="focus-table">{c["focus_cards"]}</div></div></section>'
    if style == "rail":
        return f'<section class="section section--navy" id="focus"><div class="container"><div class="focus-rail"><div>{head}</div><div>{c["focus_items"]}</div></div></div></section>'
    if style == "bento":
        return f'<section class="section section--mist" id="focus"><div class="container">{head}<div class="focus-bento">{c["focus_cards"]}</div></div></section>'
    if style == "mosaic":
        return f'<section class="section" id="focus"><div class="container">{head}<div class="focus-mosaic">{c["focus_cards"]}</div></div></section>'
    if style == "cards":
        return f'<section class="section section--mist" id="focus"><div class="container">{head}<div class="profile-focus">{c["focus_items"]}</div></div></section>'
    return f'<section class="section section--navy" id="focus"><div class="container">{head}<div class="dimension-grid">{c["focus_cards"]}</div></div></section>'


def _principles(style, c):
    head = _heading("The standard", "Principles that hold the work", "These tests connect public purpose to responsible practice.")
    if style == "manifesto":
        return f'<section class="section" id="principles"><div class="container">{head}<div class="manifesto-principles">{c["principle_rows"]}</div></div></section>'
    if style == "rows":
        return f'<section class="section section--navy" id="principles"><div class="container narrative-standard"><div>{head}</div><div class="principle-list">{c["principle_rows"]}</div></div></section>'
    if style == "pillars":
        return f'<section class="section" id="principles"><div class="container">{head}<div class="principle-pillars">{c["principles"]}</div></div></section>'
    if style == "checklist":
        return f'<section class="section principle-checks" id="principles"><div class="container"><div>{head}<p class="checks-note">Use these as a readiness review, not ceremonial language.</p></div><div>{c["principle_rows"]}</div></div></section>'
    if style == "sidebar":
        return f'<section class="section" id="principles"><div class="container principle-sidebar"><aside>{head}</aside><div class="grid grid--3">{c["principles"]}</div></div></section>'
    if style == "band":
        return f'<section class="section section--mist" id="principles"><div class="container">{head}</div><div class="principle-band-grid">{c["principle_rows"]}</div></section>'
    return f'<section class="section section--mist" id="principles"><div class="container">{head}<div class="grid grid--3">{c["principles"]}</div></div></section>'


def _process(style, c):
    head = _heading("From intent to practice", c["process_title"], c["process_intro"])
    if style == "timeline":
        return f'<section class="section section--blue" id="process"><div class="container process-split"><div>{head}</div><div class="timeline">{c["steps_vertical"]}</div></div></section>'
    if style == "vertical":
        return f'<section class="section" id="process"><div class="container process-vertical"><div>{head}</div><div class="timeline timeline--check">{c["steps_vertical"]}</div></div></section>'
    if style == "ledger":
        return f'<section class="section section--navy" id="process"><div class="container process-ledger">{head}<div>{c["steps_vertical"]}</div></div></section>'
    if style == "stair":
        return f'<section class="section" id="process"><div class="container">{head}<div class="process-stair">{c["steps"]}</div></div></section>'
    if style == "path":
        return f'<section class="section section--blue" id="process"><div class="container">{head}<div class="process-path">{c["steps"]}</div></div></section>'
    if style == "milestones":
        return f'<section class="section section--mist" id="process"><div class="container"><div class="process-header"><div>{head}</div><p class="process-pull">{c["lens"]}</p></div><div class="process-milestones">{c["steps"]}</div></div></section>'
    return f'<section class="section" id="process"><div class="container">{head}<div class="steps">{c["steps"]}</div></div></section>'


def _close(style, c):
    buttons = f'<div class="actions"><a class="button button--gold" href="{c["primary_href"]}">{c["primary_label"]}</a><a class="button button--outline" href="{c["secondary_href"]}">{c["secondary_label"]}</a></div>'
    copy = f'<div><h2>Put this work into practice</h2><p>Begin with {c["first_focus"]}, then define a contribution your capabilities or institution can support.</p></div>'
    if style == "quote":
        return f'<section class="section close-quote" id="next"><div class="container"><blockquote>“{c["lens"]}”</blockquote><div>{copy}{buttons}</div>{c["links"]}</div></section>'
    if style == "split":
        return f'<section class="close-split" id="next"><div>{copy}{buttons}</div>{c["links"]}</section>'
    if style == "compact":
        return f'<section class="close-compact" id="next"><div class="container">{copy}{buttons}</div></section><div class="container close-related">{c["links"]}</div>'
    if style == "banner":
        return f'<section class="close-banner" id="next"><div class="container">{copy}{buttons}</div></section><div class="container close-related">{c["links"]}</div>'
    if style == "inset":
        return f'<section class="section close-inset" id="next"><div class="container"><span aria-hidden="true">04</span><div>{copy}{buttons}</div>{c["links"]}</div></section>'
    return f'<section class="section layout-cta" id="next"><div class="container"><div class="cta">{copy}{buttons}</div><div class="atlas-links">{c["links"]}</div></div></section>'


def _nav(mode, order):
    if mode == "none":
        return ""
    labels = {"o": ("overview", "Overview"), "f": ("focus", "Areas of focus"), "p": ("principles", "Principles"), "x": ("process", "How it works")}
    links = "".join(f'<a href="#{labels[key][0]}"><span>0{i}</span>{labels[key][1]}</a>' for i, key in enumerate(order, 1))
    return f'<nav class="anchor-nav anchor-nav--{mode}" aria-label="On this page"><div class="container">{links}<a href="#next"><span>05</span>Next steps</a></div></nav>'


def render(page, data):
    category, heading, lead, detail, focus = data
    shared = CATEGORY[category]
    hero, order, overview, focus_style, principle_style, process_style, close_style, nav = DESIGNS[page]
    esc = html.escape
    facts_data = [("Central question", heading), ("Opening priorities", f"{focus[0][0]}; {focus[1][0]}"), ("Extended scope", f"{focus[2][0]}; {focus[3][0]}")]
    facts = "".join(f'<li><strong>{esc(k)}</strong>{esc(v)}</li>' for k, v in facts_data)
    fact_strip = "".join(f'<div><span>{esc(k)}</span><strong>{esc(v)}</strong></div>' for k, v in facts_data)
    focus_items = "".join(f'<article class="focus-item"><i class="fa fa-{ICONS[i]}" aria-hidden="true"></i><div><span class="item-index">0{i + 1}</span><h3>{esc(k)}</h3><p>{esc(v)}</p></div></article>' for i, (k, v) in enumerate(focus))
    focus_cards = "".join(f'<article class="dimension-card"><span>0{i + 1}</span><i class="fa fa-{ICONS[i]}" aria-hidden="true"></i><h3>{esc(k)}</h3><p>{esc(v)}</p></article>' for i, (k, v) in enumerate(focus))
    principles = "".join(f'<article class="card card--numbered"><span class="card__number">0{i}</span><h3>{esc(k)}</h3><p>{esc(v)} In this context, consider {esc(focus[i - 1][0].lower())}.</p></article>' for i, (k, v) in enumerate(shared["principles"], 1))
    principle_rows = "".join(f'<article class="principle-row"><span>0{i}</span><div><h3>{esc(k)}</h3><p>{esc(v)}</p></div></article>' for i, (k, v) in enumerate(shared["principles"], 1))
    steps = "".join(f'<article class="step"><h3>{esc(k)}</h3><p>{esc(v)} Here, attend to {esc(focus[i][0].lower())}: {esc(focus[i][1])}</p></article>' for i, (k, v) in enumerate(shared["steps"]))
    steps_vertical = "".join(f'<article class="timeline-step"><span>0{i + 1}</span><div><h3>{esc(k)}</h3><p>{esc(v)} Attend specifically to {esc(focus[i][0].lower())}.</p></div></article>' for i, (k, v) in enumerate(shared["steps"]))
    related = "".join(f'<li><a href="{href}">{esc(label)}</a></li>' for href, label in shared["related"])
    _, _, primary_href, primary_label, secondary_href, secondary_label = shared["cta"]
    lens = f'{focus[0][0]} establishes the point of entry; {focus[3][0].lower()} defines what should remain after the immediate work is complete.'
    intro = f'<div class="prose"><span class="eyebrow">{esc(shared["label"])}</span><h2>{esc(heading)}</h2><div class="rule"></div><p>{esc(lead)}</p><p>{esc(detail)}</p><p>{esc(lens)}</p></div>'
    links = f'<aside class="related-panel"><span class="eyebrow">Continue exploring</span><h3>Related pathways</h3><ul class="related-list">{related}</ul></aside>'
    c = {"heading": esc(heading), "lead": esc(lead), "detail": esc(detail), "label": esc(shared["label"]), "lens": esc(lens), "intro": intro, "facts": facts, "fact_strip": fact_strip, "focus_items": focus_items, "focus_cards": focus_cards, "principles": principles, "principle_rows": principle_rows, "steps": steps, "steps_vertical": steps_vertical, "process_title": esc(shared["process_title"]), "process_intro": esc(shared["process_intro"]), "links": links, "primary_href": primary_href, "primary_label": esc(primary_label), "secondary_href": secondary_href, "secondary_label": esc(secondary_label), "first_focus": esc(focus[0][0].lower())}
    blocks = {"o": _overview(overview, c), "f": _focus(focus_style, c), "p": _principles(principle_style, c), "x": _process(process_style, c)}
    return _nav(nav, order) + "".join(blocks[key] for key in order) + _close(close_style, c)


def main():
    for filename, data in PAGES.items():
        path = ROOT / filename
        source = path.read_text(encoding="utf-8")
        if 'rel="icon"' not in source:
            source = source.replace('<link rel="stylesheet" href="assets/css/icons.css">', '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/css/icons.css">', 1)
        if 'rel="canonical"' not in source:
            canonical = f'<link rel="canonical" href="https://usfellows.org/{filename}">'
            source = source.replace('</head>', canonical + '</head>', 1)
        hero = DESIGNS[filename][0]
        source = re.sub(r'<header class="page-hero(?: page-hero--[a-z-]+)?"',
                        f'<header class="page-hero page-hero--{hero}"', source, count=1)
        header_end = source.find("</header>")
        main_end = source.find("</main>")
        if header_end < 0 or main_end < 0 or header_end > main_end:
            raise RuntimeError(f"Cannot locate content boundaries in {filename}")
        expanded = source[:header_end + len("</header>")] + render(filename, data) + source[main_end:]
        path.write_text(expanded, encoding="utf-8")

    print(f"Expanded {len(PAGES)} destination pages.")


if __name__ == "__main__":
    main()
