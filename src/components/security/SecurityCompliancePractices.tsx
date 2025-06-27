import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Buildings, Globe, Code, MagnifyingGlass, Lightning, Key } from '@phosphor-icons/react';

interface SecurityPillar {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  services: SecurityService[];
}

interface SecurityService {
  name: string;
  description: string;
  bestPractices: string[];
}

interface SecurityPrinciple {
  id: string;
  name: string;
  description: string;
  azureServices: string[];
}

const securityPrinciples: SecurityPrinciple[] = [
  {
    id: "secure-by-design",
    name: "Secure by Design",
    description: "Build it right from the start.",
    azureServices: ["Azure SDL", "Threat Modeling Tool", "Azure DevOps (security gates)"]
  },
  {
    id: "secure-by-default",
    name: "Secure by Default",
    description: "Secure out of the box.",
    azureServices: ["Azure Policy", "Azure Blueprints", "Defender for Cloud (defaults)"]
  },
  {
    id: "secure-operations",
    name: "Secure Operations",
    description: "Stay secure while running.",
    azureServices: ["Azure Monitor", "Microsoft Sentinel", "Azure Automation"]
  }
];

const securityPillars: SecurityPillar[] = [
  {
    id: "identity-secrets",
    name: "Protect Identities and Secrets",
    icon: <Key size={24} className="text-primary" />,
    description: "Control access and protect sensitive credentials.",
    services: [
      {
        name: "Azure Active Directory (Entra ID)",
        description: "Control who gets in and what they can access.",
        bestPractices: [
          "Enforce Multi-Factor Authentication (MFA) and use Identity Governance for lifecycle management",
          "Implement Conditional Access policies for risk-based authentication",
          "Regularly review and clean up user accounts and permissions",
          "Use Privileged Identity Management (PIM) for just-in-time admin access"
        ]
      },
      {
        name: "Microsoft Entra Conditional Access",
        description: "Let the right people in, under the right conditions.",
        bestPractices: [
          "Define granular policies based on user risk, device compliance, and location",
          "Implement sign-in risk policies to detect unusual access patterns",
          "Block access from unsecured or unfamiliar devices",
          "Create location-based policies to restrict access from high-risk regions"
        ]
      },
      {
        name: "Azure Key Vault",
        description: "Lock away secrets—securely and centrally.",
        bestPractices: [
          "Use RBAC for access control, enable soft-delete and purge protection, and rotate secrets regularly",
          "Implement just-in-time access to sensitive secrets",
          "Monitor and audit all secret access attempts",
          "Separate secrets across different key vaults based on environment and sensitivity"
        ]
      },
      {
        name: "Azure AD Identity Protection",
        description: "Spot and stop identity risks before they spread.",
        bestPractices: [
          "Monitor risky sign-ins and users, and automate remediation with Conditional Access policies",
          "Configure risk-based step-up authentication",
          "Set up alerts for unusual user behavior",
          "Regularly review and investigate flagged risk events"
        ]
      }
    ]
  },
  {
    id: "tenant-isolation",
    name: "Protect Tenants and Isolate Production Systems",
    icon: <Buildings size={24} className="text-primary" />,
    description: "Maintain separation between environments and manage permissions at scale.",
    services: [
      {
        name: "Azure Lighthouse",
        description: "Manage multiple tenants securely, from one place.",
        bestPractices: [
          "Use delegated resource management with just-in-time access and activity logging",
          "Implement least-privilege access for cross-tenant management",
          "Set up activity alerts across managed tenants",
          "Regularly review delegated permissions"
        ]
      },
      {
        name: "Azure Management Groups",
        description: "Organize and govern at scale, with clarity.",
        bestPractices: [
          "Apply policies and RBAC at the management group level for consistent governance",
          "Design hierarchical structure that matches your organizational structure",
          "Implement compliance auditing across management groups",
          "Separate production and non-production environments at management group level"
        ]
      },
      {
        name: "Azure Role-Based Access Control (RBAC)",
        description: "Give just enough access—no more, no less.",
        bestPractices: [
          "Follow the principle of least privilege and review access assignments regularly",
          "Use custom roles when built-in roles don't provide the right permission scope",
          "Implement regular access reviews and certification",
          "Audit permission changes and escalations"
        ]
      },
      {
        name: "Azure Arc",
        description: "Extend Azure security to any environment.",
        bestPractices: [
          "Use Azure Policy and Defender for Cloud to enforce compliance across hybrid environments",
          "Implement consistent security controls across on-premises and cloud resources",
          "Deploy security monitoring agents to all Arc-enabled servers",
          "Manage security configurations centrally"
        ]
      }
    ]
  },
  {
    id: "network-protection",
    name: "Protect Networks",
    icon: <Globe size={24} className="text-primary" />,
    description: "Secure communication pathways and prevent unauthorized access.",
    services: [
      {
        name: "Azure Firewall",
        description: "Block threats at the gate—intelligently.",
        bestPractices: [
          "Enable threat intelligence-based filtering and log all traffic for auditing",
          "Implement hierarchical rule structure with careful ordering",
          "Use FQDN filtering for outbound traffic control",
          "Deploy in forced-tunneling mode to prevent bypassing"
        ]
      },
      {
        name: "Azure DDoS Protection",
        description: "Shield your services from overwhelming attacks.",
        bestPractices: [
          "Enable for all public-facing endpoints and monitor metrics for anomalies",
          "Configure alerts for potential attack events",
          "Test protection mechanisms with simulated attack scenarios",
          "Understand and plan for remaining risks after mitigation"
        ]
      },
      {
        name: "Network Security Groups (NSGs)",
        description: "Control traffic with precision.",
        bestPractices: [
          "Apply rules at both subnet and NIC levels, and audit regularly",
          "Use service tags to simplify rule management",
          "Implement just-in-time access for management ports",
          "Audit existing rules periodically for unauthorized changes"
        ]
      },
      {
        name: "Azure Private Link & VNet Peering",
        description: "Keep data private and connections secure.",
        bestPractices: [
          "Use Private Link for secure service access and VNet Peering for isolated communication",
          "Implement service endpoints for Azure services where Private Link isn't available",
          "Use network isolation patterns for multi-tier applications",
          "Regularly audit network traffic flows between peered networks"
        ]
      }
    ]
  },
  {
    id: "engineering-protection",
    name: "Protect Engineering Systems",
    icon: <Code size={24} className="text-primary" />,
    description: "Secure the development pipeline and code assets.",
    services: [
      {
        name: "GitHub Advanced Security",
        description: "Secure your code where it lives.",
        bestPractices: [
          "Enable secret scanning, code scanning, and dependency review",
          "Implement branch protection rules for critical repositories",
          "Use security advisories to responsibly disclose and track vulnerabilities",
          "Configure automated security scans in pull requests"
        ]
      },
      {
        name: "Azure DevOps (secure pipelines)",
        description: "Build and release with built-in trust.",
        bestPractices: [
          "Use secure build agents, gated releases, and enforce branch protection",
          "Scan all dependencies for vulnerabilities before deployment",
          "Implement approval gates for production deployments",
          "Secure secrets using Azure Key Vault integration"
        ]
      },
      {
        name: "Microsoft Defender for DevOps",
        description: "Detect and fix risks in your CI/CD flow.",
        bestPractices: [
          "Integrate security checks into CI/CD pipelines and monitor for misconfigurations",
          "Set up automated policy checks against secure baseline",
          "Track remediation of security findings",
          "Integrate with development team workflows and tools"
        ]
      },
      {
        name: "Azure Container Registry (ACR) Scanning",
        description: "Scan images before they ship.",
        bestPractices: [
          "Automate image scanning and enforce policies for base image hygiene",
          "Implement vulnerability severity gates for deployment",
          "Maintain trusted image repositories with verified signatures",
          "Regularly scan and update base images"
        ]
      }
    ]
  },
  {
    id: "threat-monitoring",
    name: "Monitor and Detect Threats",
    icon: <MagnifyingGlass size={24} className="text-primary" />,
    description: "Identify potential security incidents quickly and accurately.",
    services: [
      {
        name: "Microsoft Sentinel",
        description: "See threats coming—act fast.",
        bestPractices: [
          "Use built-in analytics rules, custom workbooks, and threat intelligence integration",
          "Implement automation playbooks for common alert types",
          "Configure data sources for comprehensive coverage",
          "Establish triage and investigation processes"
        ]
      },
      {
        name: "Microsoft Defender for Cloud",
        description: "Get a bird's-eye view of your cloud security.",
        bestPractices: [
          "Enable continuous assessment and act on secure score recommendations",
          "Deploy Defender plans across all subscription resources",
          "Configure automated remediation for common findings",
          "Regularly review security posture and findings"
        ]
      },
      {
        name: "Azure Monitor Logs",
        description: "Turn logs into insights.",
        bestPractices: [
          "Centralize log collection and use KQL queries for deep insights",
          "Configure retention policies based on compliance needs",
          "Set up alert rules for critical security events",
          "Implement log analytics workspaces with proper access controls"
        ]
      },
      {
        name: "Azure Security Center",
        description: "Centralize your security posture.",
        bestPractices: [
          "Regularly review recommendations and integrate with Defender for Cloud",
          "Configure continuous export to SIEM solutions",
          "Implement custom policies for organization-specific requirements",
          "Track security score trends over time"
        ]
      }
    ]
  },
  {
    id: "response-remediation",
    name: "Accelerate Response and Remediation",
    icon: <Lightning size={24} className="text-primary" />,
    description: "Act quickly to contain and mitigate security incidents.",
    services: [
      {
        name: "Sentinel Playbooks (Logic Apps)",
        description: "Automate your response—instantly.",
        bestPractices: [
          "Automate incident response workflows and integrate with ticketing systems",
          "Design playbooks for common incident types",
          "Include human approval steps for critical actions",
          "Test playbooks regularly in simulation mode"
        ]
      },
      {
        name: "Azure Automation Runbooks",
        description: "Fix issues before they escalate.",
        bestPractices: [
          "Schedule patching, remediation, and compliance enforcement tasks",
          "Implement secure credential handling in runbooks",
          "Use runbooks for routine security tasks and validation",
          "Maintain proper version control and testing"
        ]
      },
      {
        name: "Microsoft Defender XDR",
        description: "Correlate and respond across domains.",
        bestPractices: [
          "Correlate incidents across endpoints, identities, and cloud workloads",
          "Deploy automated investigation and remediation capabilities",
          "Configure alerts for cross-domain security events",
          "Establish procedures for incident prioritization"
        ]
      },
      {
        name: "Azure Backup & Site Recovery",
        description: "Recover fast, stay resilient.",
        bestPractices: [
          "Test recovery plans regularly and ensure backup encryption and retention policies",
          "Implement air-gapped backup solutions for critical systems",
          "Secure backup access credentials with proper authentication",
          "Regularly validate recovery time objectives (RTOs)"
        ]
      }
    ]
  }
];

const SecurityCompliancePractices = () => {
  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Azure AI Security and Compliance</h3>
            <p className="text-muted-foreground">
              Comprehensive security and compliance practices for implementing Azure AI agents in regulated industries.
              These best practices are aligned with Microsoft's Secure Future Initiative (SFI) and are essential for
              enterprise AI deployments.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="principles" className="w-full">
        <TabsList>
          <TabsTrigger value="principles">Security Principles</TabsTrigger>
          <TabsTrigger value="pillars">Security Pillars (SFI)</TabsTrigger>
          <TabsTrigger value="regulated">Regulated Industries</TabsTrigger>
        </TabsList>

        <TabsContent value="principles" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {securityPrinciples.map((principle) => (
              <Card key={principle.id} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{principle.name}</CardTitle>
                  <CardDescription>{principle.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium mb-2">Azure Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {principle.azureServices.map((service, index) => (
                      <Badge key={index} variant="outline" className="bg-secondary/10">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Principles Implementation</CardTitle>
              <CardDescription>
                Essential security practices to follow when implementing Azure AI agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Secure by Design</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Incorporate threat modeling in the initial design of AI agents</li>
                  <li>Define clear trust boundaries between agent components</li>
                  <li>Design with least privilege in mind from the beginning</li>
                  <li>Create explicit security requirements alongside functional ones</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Secure by Default</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Implement appropriate access controls without user configuration</li>
                  <li>Enable logging and monitoring automatically</li>
                  <li>Deploy sensible rate limits for API endpoints</li>
                  <li>Ensure secure connection defaults (TLS, encryption)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Secure Operations</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Establish continuous monitoring for unusual agent behavior</li>
                  <li>Implement proper secret rotation procedures</li>
                  <li>Conduct regular security assessments and penetration testing</li>
                  <li>Maintain security incident response plans specific to AI systems</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pillars" className="space-y-6 pt-6">
          <Accordion type="single" collapsible className="w-full">
            {securityPillars.map((pillar) => (
              <AccordionItem key={pillar.id} value={pillar.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-md bg-primary/10">
                      {pillar.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{pillar.name}</h3>
                      <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12 pr-4 pb-4 space-y-6">
                    {pillar.services.map((service, idx) => (
                      <div key={idx} className="border-l-2 border-primary/30 pl-4">
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {service.bestPractices.map((practice, practiceIdx) => (
                            <li key={practiceIdx} className="text-sm">{practice}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="regulated" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulated Industry Security Guidelines</CardTitle>
              <CardDescription>
                Specific security considerations for AI agents in regulated industries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Financial Services</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Implement robust audit trails for all agent actions and decisions</li>
                    <li>Deploy pattern detection for suspicious financial transactions</li>
                    <li>Enforce strict data residency controls for personal financial information</li>
                    <li>Enable real-time fraud detection integration with agent operations</li>
                    <li>Implement model explainability requirements for regulatory compliance</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Healthcare</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Ensure HIPAA compliance with proper PHI handling protocols</li>
                    <li>Implement end-to-end encryption for all patient data</li>
                    <li>Deploy advanced access controls with clinical role-based permissions</li>
                    <li>Maintain comprehensive audit logs for all PHI access events</li>
                    <li>Implement secure de-identification techniques for training data</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Government</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Apply appropriate security classifications to different data types</li>
                    <li>Implement FedRAMP-compliant hosting and security controls</li>
                    <li>Establish strict data sovereignty enforcement mechanisms</li>
                    <li>Deploy continuous monitoring aligned with NIST frameworks</li>
                    <li>Implement strong identity verification and access management</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Cross-Industry Compliance</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Design data retention policies compliant with GDPR, CCPA, and similar regulations</li>
                    <li>Implement privacy-by-design principles in all agent interactions</li>
                    <li>Deploy appropriate consent management frameworks</li>
                    <li>Establish clear data lineage for training datasets</li>
                    <li>Create thorough documentation of security controls for audit purposes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Strategies</CardTitle>
              <CardDescription>
                Recommendations for implementing security in regulated environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Compliance Documentation</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Maintain detailed data processing records for all agent operations</li>
                    <li>Document all prompt engineering decisions with security implications</li>
                    <li>Create comprehensive agent capability and limitation documentation</li>
                    <li>Establish clear incident response procedures specific to AI systems</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Conduct regular AI-specific security risk assessments</li>
                    <li>Evaluate prompt injection and data poisoning vulnerabilities</li>
                    <li>Assess prompt/completion leakage risks in shared models</li>
                    <li>Analyze potential for model inversion or membership inference attacks</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Continuous Improvement</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Implement regular security reviews of agent behaviors</li>
                    <li>Perform ongoing vulnerability scanning of infrastructure</li>
                    <li>Maintain up-to-date security controls as AI capabilities evolve</li>
                    <li>Establish feedback loops between security observations and model development</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityCompliancePractices;