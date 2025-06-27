import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Warning, CheckCircle, Info } from '@phosphor-icons/react';

interface SecurityControl {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string[];
}

interface PatternSecurityConfig {
  patternId: string;
  keyVulnerabilities: {
    name: string;
    description: string;
    mitigation: string;
  }[];
  securityControls: SecurityControl[];
  bestPractices: {
    category: string;
    practices: string[];
  }[];
}

// Define security controls for different agent patterns
const patternSecurityConfigurations: PatternSecurityConfig[] = [
  {
    patternId: 'react',
    keyVulnerabilities: [
      {
        name: 'Tool Output Injection',
        description: 'Malicious content in tool outputs could influence agent reasoning and actions',
        mitigation: 'Implement strict validation and sanitization of all tool outputs before they are processed by the agent'
      },
      {
        name: 'Reasoning Chain Manipulation',
        description: 'External inputs could be designed to manipulate the reasoning process',
        mitigation: 'Add safeguards that validate reasoning steps against expected patterns and detect anomalies'
      }
    ],
    securityControls: [
      {
        id: 'input-validation',
        name: 'Input Validation and Sanitization',
        description: 'Implement comprehensive validation for all external inputs that might influence the agent\'s reasoning process',
        impact: 'high',
        implementation: [
          'Use Azure Content Safety to scan all user inputs before processing',
          'Implement domain-specific validation rules for each external data source',
          'Create allowlists for acceptable input patterns when possible'
        ]
      },
      {
        id: 'output-monitoring',
        name: 'Action Output Monitoring',
        description: 'Monitor the outputs of agent actions for suspicious patterns or behaviors',
        impact: 'medium',
        implementation: [
          'Log all agent actions and tool uses to Azure Monitor',
          'Implement rules to detect unexpected action sequences',
          'Configure alerts for unusual tool usage patterns'
        ]
      },
      {
        id: 'reasoning-validation',
        name: 'Reasoning Chain Validation',
        description: 'Validate the agent\'s reasoning process to ensure it follows expected patterns',
        impact: 'high',
        implementation: [
          'Use Azure OpenAI to implement a secondary validation model that reviews reasoning steps',
          'Define expected reasoning patterns and validate each step against them',
          'Implement circuit breakers to stop execution if reasoning appears compromised'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Tool Security',
        practices: [
          'Implement access control for each tool used by the agent',
          'Validate all outputs from external tools before incorporating them into the reasoning chain',
          'Use Azure Managed Identities for tool authentication instead of API keys',
          'Implement rate limiting for all tool calls to prevent abuse'
        ]
      },
      {
        category: 'Content Safety',
        practices: [
          'Use Azure Content Safety to screen inputs and outputs',
          'Implement pre-verification of knowledge sources used in reasoning',
          'Maintain retrieval boundaries to prevent unauthorized information access'
        ]
      }
    ]
  },
  {
    patternId: 'agent-to-agent',
    keyVulnerabilities: [
      {
        name: 'Cross-Agent Message Manipulation',
        description: 'Messages between agents could be tampered with to manipulate system behavior',
        mitigation: 'Implement message signing, encryption, and integrity checks for all inter-agent communications'
      },
      {
        name: 'Agent Impersonation',
        description: 'Malicious actors could attempt to impersonate trusted agents',
        mitigation: 'Use Azure Active Directory managed identities and strong authentication for all agents'
      }
    ],
    securityControls: [
      {
        id: 'message-integrity',
        name: 'Message Integrity Protection',
        description: 'Ensure the integrity of messages exchanged between agents',
        impact: 'high',
        implementation: [
          'Implement message signing using Azure Key Vault managed keys',
          'Add timestamps and message IDs to detect replay attacks',
          'Verify message integrity before processing any agent requests'
        ]
      },
      {
        id: 'agent-authentication',
        name: 'Strong Agent Authentication',
        description: 'Implement robust authentication mechanisms for all agents in the system',
        impact: 'high',
        implementation: [
          'Use Azure Active Directory managed identities for each agent',
          'Implement mutual TLS (mTLS) for agent-to-agent communications',
          'Regularly rotate authentication credentials'
        ]
      },
      {
        id: 'communication-monitoring',
        name: 'Agent Communication Monitoring',
        description: 'Monitor and analyze communications between agents to detect suspicious patterns',
        impact: 'medium',
        implementation: [
          'Log all inter-agent communications to Azure Monitor',
          'Implement anomaly detection for communication patterns',
          'Set up alerts for unusual message volumes or content'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Communication Security',
        practices: [
          'Use encrypted channels for all agent communications',
          'Implement message validation schemas for each agent interaction type',
          'Create allowlists for expected communication patterns',
          'Use Azure API Management to govern and monitor agent API interactions'
        ]
      },
      {
        category: 'Access Control',
        practices: [
          'Implement least privilege principles for each agent's capabilities',
          'Use Azure RBAC to control access to shared resources',
          'Regularly audit agent permissions and access patterns',
          'Implement just-in-time access for critical capabilities'
        ]
      }
    ]
  },
  {
    patternId: 'plan-and-execute',
    keyVulnerabilities: [
      {
        name: 'Plan Manipulation',
        description: 'External inputs could be designed to create malicious or undesirable plans',
        mitigation: 'Implement a plan validation step using a separate model to verify plan safety and alignment'
      },
      {
        name: 'Execution Boundary Violations',
        description: 'Agent might attempt to execute actions outside approved boundaries',
        mitigation: 'Create clear execution boundaries with technical enforcement mechanisms'
      }
    ],
    securityControls: [
      {
        id: 'plan-validation',
        name: 'Plan Review and Validation',
        description: 'Validate generated plans against safety and security guidelines before execution',
        impact: 'high',
        implementation: [
          'Implement a secondary model to review plans for security risks',
          'Create rule-based validators for domain-specific constraints',
          'Include human approval workflows for high-risk plans using Azure Logic Apps'
        ]
      },
      {
        id: 'execution-monitoring',
        name: 'Step-by-Step Execution Monitoring',
        description: 'Monitor each execution step for compliance with approved plan and security boundaries',
        impact: 'high',
        implementation: [
          'Log each execution step with context to Azure Monitor',
          'Implement circuit breakers to halt execution if unexpected actions are detected',
          'Use Azure Functions with durable orchestrations to manage execution flow securely'
        ]
      },
      {
        id: 'resource-governance',
        name: 'Resource Access Governance',
        description: 'Control and monitor access to resources during plan execution',
        impact: 'medium',
        implementation: [
          'Use Azure Managed Identities with least privilege for resource access',
          'Implement resource usage quotas and rate limiting',
          'Create audit trails for all resource access during execution'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Planning Security',
        practices: [
          'Define clear planning boundaries and constraints',
          'Implement separate models for planning and execution to create separation of concerns',
          'Validate plans against a knowledge base of known-safe strategies',
          'Include safety checks as explicit steps in the planning process'
        ]
      },
      {
        category: 'Execution Security',
        practices: [
          'Create sandboxed execution environments using Azure Container Instances',
          'Implement roll-back capabilities for each execution step',
          'Validate execution results against expected outcomes',
          'Create time-boxed execution windows for each plan'
        ]
      }
    ]
  },
  {
    patternId: 'evaluator-optimizer',
    keyVulnerabilities: [
      {
        name: 'Evaluation Criteria Manipulation',
        description: 'Attackers might attempt to compromise evaluation criteria to influence optimization',
        mitigation: 'Secure evaluation criteria definitions and implement tamper detection'
      },
      {
        name: 'Optimizer Poisoning',
        description: 'Feeding manipulated evaluation results to influence optimizer behavior',
        mitigation: 'Validate evaluation results and implement anomaly detection for suspicious patterns'
      }
    ],
    securityControls: [
      {
        id: 'criteria-protection',
        name: 'Evaluation Criteria Protection',
        description: 'Secure the definition and application of evaluation criteria',
        impact: 'high',
        implementation: [
          'Store evaluation criteria in Azure Key Vault with access controls',
          'Version and audit all changes to evaluation criteria',
          'Implement integrity checks to detect unauthorized modifications'
        ]
      },
      {
        id: 'evaluation-validation',
        name: 'Evaluation Result Validation',
        description: 'Validate evaluation results for consistency and integrity',
        impact: 'medium',
        implementation: [
          'Implement statistical validation of evaluation results',
          'Use multiple independent evaluators for critical assessments',
          'Log and monitor evaluation patterns using Azure Monitor'
        ]
      },
      {
        id: 'optimization-boundaries',
        name: 'Optimization Safety Boundaries',
        description: 'Define and enforce safe boundaries for optimization processes',
        impact: 'high',
        implementation: [
          'Define clear optimization constraints using Azure AI Studio',
          'Implement circuit breakers to detect optimization beyond acceptable boundaries',
          'Create rollback mechanisms for optimization experiments'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Evaluation Security',
        practices: [
          'Use multiple evaluation methods to prevent single-point manipulation',
          'Implement baseline comparisons to detect unusual evaluation results',
          'Create audit trails for all evaluation processes',
          'Regularly validate evaluation metrics against ground truth'
        ]
      },
      {
        category: 'Optimization Security',
        practices: [
          'Implement gradual optimization with safety checkpoints',
          'Create sandbox environments for testing optimization results',
          'Use Azure AI Evaluation SDK to validate optimization improvements',
          'Maintain version control of optimization algorithms and parameters'
        ]
      }
    ]
  },
  {
    patternId: 'orchestrator-worker',
    keyVulnerabilities: [
      {
        name: 'Orchestrator Hijacking',
        description: 'Attempt to compromise the orchestrator to control multiple workers',
        mitigation: 'Implement enhanced security controls and monitoring for the orchestrator agent'
      },
      {
        name: 'Malicious Worker Behavior',
        description: 'Compromised workers might produce harmful outputs or exfiltrate data',
        mitigation: 'Implement worker isolation and output validation before aggregation'
      }
    ],
    securityControls: [
      {
        id: 'orchestrator-protection',
        name: 'Orchestrator Advanced Security',
        description: 'Enhanced security controls for the orchestrator component',
        impact: 'high',
        implementation: [
          'Deploy the orchestrator in an isolated Azure Virtual Network',
          'Implement additional authentication layers for orchestrator access',
          'Set up comprehensive monitoring and alerting for orchestrator behavior'
        ]
      },
      {
        id: 'worker-isolation',
        name: 'Worker Isolation and Containment',
        description: 'Isolate worker components to prevent lateral movement',
        impact: 'medium',
        implementation: [
          'Deploy workers in separate Azure Container Instances',
          'Implement network security groups to control worker communications',
          'Use Azure Private Link to secure connections between orchestrator and workers'
        ]
      },
      {
        id: 'task-validation',
        name: 'Task Assignment Validation',
        description: 'Validate task assignments before distribution to workers',
        impact: 'medium',
        implementation: [
          'Implement integrity checks for all task assignments',
          'Create task validation rules based on worker capabilities',
          'Log and monitor task distribution patterns'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Orchestration Security',
        practices: [
          'Implement least privilege for orchestrator operations',
          'Create backup orchestration capabilities for resilience',
          'Use Azure Logic Apps for secure workflow management',
          'Implement circuit breakers to detect orchestration anomalies'
        ]
      },
      {
        category: 'Worker Security',
        practices: [
          'Validate all worker outputs before aggregation',
          'Implement resource usage limits for each worker',
          'Create worker reputation systems based on output quality',
          'Use Azure Container Instances with resource governance for worker isolation'
        ]
      }
    ]
  },
  {
    patternId: 'reflexion',
    keyVulnerabilities: [
      {
        name: 'Reflection Manipulation',
        description: 'Attackers might attempt to manipulate the self-reflection process to influence agent behavior',
        mitigation: 'Secure the reflection process and validate reflection outputs'
      },
      {
        name: 'Feedback Loop Poisoning',
        description: 'Introducing malicious feedback to corrupt the reflection process over time',
        mitigation: 'Implement validation of feedback signals and detection of anomalous reflection patterns'
      }
    ],
    securityControls: [
      {
        id: 'reflection-integrity',
        name: 'Reflection Process Integrity',
        description: 'Ensure the integrity of the self-reflection process',
        impact: 'high',
        implementation: [
          'Use a separate Azure OpenAI deployment for reflection with stricter controls',
          'Implement validation of reflection outputs against expected patterns',
          'Log and audit all reflection processes with Azure Monitor'
        ]
      },
      {
        id: 'feedback-validation',
        name: 'Feedback Signal Validation',
        description: 'Validate feedback signals used in the reflection process',
        impact: 'medium',
        implementation: [
          'Implement statistical validation of feedback signals',
          'Use Azure AI Evaluation to verify feedback quality',
          'Create feedback authentication mechanisms to prevent spoofing'
        ]
      },
      {
        id: 'reflection-boundaries',
        name: 'Reflection Safety Boundaries',
        description: 'Define and enforce safety boundaries for self-reflection',
        impact: 'medium',
        implementation: [
          'Create clear guidelines for acceptable reflection outputs',
          'Implement circuit breakers for reflection processes',
          'Use content safety checks on reflection results'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Reflection Security',
        practices: [
          'Isolate the reflection process from main agent functions',
          'Implement version control for reflection strategies',
          'Create audit trails for all reflection-based changes',
          'Use Azure Key Vault to store sensitive reflection parameters'
        ]
      },
      {
        category: 'Learning Security',
        practices: [
          'Implement gradual incorporation of reflection-based learning',
          'Validate learning outcomes against safety criteria',
          'Create rollback mechanisms for problematic learning outcomes',
          'Use Azure AI Evaluation to assess safety of learned behaviors'
        ]
      }
    ]
  },
  {
    patternId: 'routing',
    keyVulnerabilities: [
      {
        name: 'Routing Decision Manipulation',
        description: 'Attacker attempts to manipulate routing decisions to reach restricted capabilities',
        mitigation: 'Secure the routing logic and implement validation of routing decisions'
      },
      {
        name: 'Specialized Agent Exploitation',
        description: 'Targeting vulnerabilities in specialized downstream agents',
        mitigation: 'Implement consistent security controls across all agent types in the routing system'
      }
    ],
    securityControls: [
      {
        id: 'routing-logic-protection',
        name: 'Routing Logic Protection',
        description: 'Secure the decision-making logic used to route queries',
        impact: 'high',
        implementation: [
          'Implement Azure OpenAI with system message constraints for routing decisions',
          'Create allowlists for valid routing patterns',
          'Log and audit all routing decisions with justifications'
        ]
      },
      {
        id: 'cross-agent-security',
        name: 'Consistent Cross-Agent Security',
        description: 'Ensure consistent security controls across all agents in the system',
        impact: 'medium',
        implementation: [
          'Deploy common security configuration using Azure Policy',
          'Implement security baselines for all agent types',
          'Use centralized logging and monitoring for all agents'
        ]
      },
      {
        id: 'request-validation',
        name: 'Request Validation and Sanitization',
        description: 'Validate and sanitize all requests before routing',
        impact: 'high',
        implementation: [
          'Implement Azure Content Safety checks before routing',
          'Create request validation schemas for each agent type',
          'Use Azure API Management for centralized request processing'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Routing Security',
        practices: [
          'Implement explicit access control lists for routing destinations',
          'Create audit trails for routing decisions',
          'Use rate limiting to prevent routing abuse',
          'Implement circuit breakers for unusual routing patterns'
        ]
      },
      {
        category: 'Agent Ecosystem Security',
        practices: [
          'Deploy consistent authentication across all agents',
          'Implement uniformly strong content filtering for all agents',
          'Create a security assessment process for new agent onboarding',
          'Use Azure Managed Identities for all agent service accounts'
        ]
      }
    ]
  },
  {
    patternId: 'codeact',
    keyVulnerabilities: [
      {
        name: 'Code Injection',
        description: 'Malicious code could be generated or executed in the agent environment',
        mitigation: 'Implement strict code validation, sanitization, and sandboxed execution'
      },
      {
        name: 'Access Control Bypass',
        description: 'Generated code might attempt to bypass system restrictions',
        mitigation: 'Create isolated execution environments with strict permission boundaries'
      }
    ],
    securityControls: [
      {
        id: 'code-validation',
        name: 'Code Validation and Analysis',
        description: 'Validate and analyze generated code for security issues',
        impact: 'high',
        implementation: [
          'Implement static code analysis using Azure DevOps security scanning',
          'Create pattern-matching rules for known dangerous code patterns',
          'Use Azure OpenAI to analyze code security before execution'
        ]
      },
      {
        id: 'sandboxed-execution',
        name: 'Secure Sandbox Execution',
        description: 'Execute generated code in secure, isolated environments',
        impact: 'high',
        implementation: [
          'Deploy Azure Container Instances for isolated code execution',
          'Implement resource limits and timeouts for all code execution',
          'Create network isolation for sandbox environments'
        ]
      },
      {
        id: 'execution-monitoring',
        name: 'Code Execution Monitoring',
        description: 'Monitor code execution for suspicious behavior',
        impact: 'medium',
        implementation: [
          'Log all code execution activities to Azure Monitor',
          'Implement behavioral analysis for executed code',
          'Create alerts for unusual resource access patterns'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Code Generation Security',
        practices: [
          'Implement strict prompt engineering practices for code generation',
          'Use Azure Content Safety to filter generated code',
          'Create allowlists for permissible code patterns and libraries',
          'Implement code generation review workflow for high-risk operations'
        ]
      },
      {
        category: 'Execution Security',
        practices: [
          'Use Azure Kubernetes Service with pod security policies for isolation',
          'Implement least privilege principles for execution environments',
          'Create timeout mechanisms for all code execution',
          'Maintain audit logs of all executed code and outcomes'
        ]
      }
    ]
  },
  {
    patternId: 'self-reflection',
    keyVulnerabilities: [
      {
        name: 'Reflection Process Manipulation',
        description: 'Attempts to manipulate the reflection process to influence future behavior',
        mitigation: 'Secure reflection inputs and outputs, and implement validation of reflection results'
      },
      {
        name: 'Memory Poisoning',
        description: 'Introducing false or harmful information into agent memory through reflection',
        mitigation: 'Implement memory validation and authenticate reflection-based memory updates'
      }
    ],
    securityControls: [
      {
        id: 'reflection-validation',
        name: 'Reflection Process Validation',
        description: 'Validate the inputs and outputs of the reflection process',
        impact: 'high',
        implementation: [
          'Use Azure AI Evaluation to validate reflection quality',
          'Implement separate models for reflection validation',
          'Create reflection output schemas and validators'
        ]
      },
      {
        id: 'memory-protection',
        name: 'Memory Integrity Protection',
        description: 'Protect agent memory from unauthorized or invalid updates',
        impact: 'high',
        implementation: [
          'Store agent memory in Azure Cosmos DB with strong consistency',
          'Implement version control and history for memory contents',
          'Create access controls for memory modification'
        ]
      },
      {
        id: 'behavioral-monitoring',
        name: 'Behavioral Drift Monitoring',
        description: 'Monitor for unexpected changes in agent behavior after reflection',
        impact: 'medium',
        implementation: [
          'Implement baseline behavior profiles in Azure Monitor',
          'Create alerts for significant behavioral changes',
          'Use A/B testing to validate reflection-based improvements'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Reflection Security',
        practices: [
          'Create isolated reflection contexts separate from operational contexts',
          'Implement approval workflows for significant reflection-based changes',
          'Use Azure Key Vault to protect reflection algorithms',
          'Create audit trails for all reflection processes'
        ]
      },
      {
        category: 'Memory Security',
        practices: [
          'Implement encryption for sensitive memory contents',
          'Create access control lists for memory modification',
          'Use Azure Cosmos DB change feed to track memory modifications',
          'Implement memory consistency checks and validation'
        ]
      }
    ]
  },
  {
    patternId: 'agentic-rag',
    keyVulnerabilities: [
      {
        name: 'Knowledge Base Poisoning',
        description: 'Injection of malicious content into knowledge sources',
        mitigation: 'Implement strict validation of knowledge sources and content sanitization'
      },
      {
        name: 'Unauthorized Information Access',
        description: 'Attempts to extract sensitive information from knowledge base',
        mitigation: 'Implement access controls and filtering for knowledge retrieval'
      }
    ],
    securityControls: [
      {
        id: 'knowledge-validation',
        name: 'Knowledge Source Validation',
        description: 'Validate and sanitize all content in knowledge sources',
        impact: 'high',
        implementation: [
          'Use Azure Content Safety to scan knowledge base content',
          'Implement metadata validation for all knowledge sources',
          'Create content approval workflows for knowledge base updates'
        ]
      },
      {
        id: 'retrieval-security',
        name: 'Secure Retrieval Controls',
        description: 'Implement security controls for the retrieval process',
        impact: 'high',
        implementation: [
          'Use Azure AI Search security filters for content access control',
          'Implement query validation and sanitization',
          'Create audit trails for all retrieval operations'
        ]
      },
      {
        id: 'generation-guardrails',
        name: 'Generation Security Guardrails',
        description: 'Add security controls to the generation process',
        impact: 'medium',
        implementation: [
          'Implement Azure OpenAI content filtering',
          'Create validation rules for generated content',
          'Use post-generation review for sensitive operations'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Knowledge Security',
        practices: [
          'Implement classification and access controls for knowledge content',
          'Create data lineage tracking for all knowledge sources',
          'Use Azure AI Search with security trimming',
          'Implement regular security scans of knowledge base content'
        ]
      },
      {
        category: 'Retrieval-Generation Security',
        practices: [
          'Create security boundaries between retrieval and generation components',
          'Implement citation validation for generated content',
          'Use Azure Content Safety for pre- and post-generation filtering',
          'Create audit logs of retrieval patterns and usage'
        ]
      }
    ]
  },
  {
    patternId: 'autonomous-workflow',
    keyVulnerabilities: [
      {
        name: 'Workflow Manipulation',
        description: 'Attackers might attempt to manipulate the workflow to perform unauthorized actions',
        mitigation: 'Implement workflow validation and execution monitoring with strong boundaries'
      },
      {
        name: 'Resource Abuse',
        description: 'Autonomous workflows might be manipulated to abuse available resources',
        mitigation: 'Implement resource governance and usage monitoring for all workflow steps'
      }
    ],
    securityControls: [
      {
        id: 'workflow-validation',
        name: 'Workflow Definition Validation',
        description: 'Validate workflow definitions against security policies',
        impact: 'high',
        implementation: [
          'Implement workflow schema validation using Azure Logic Apps',
          'Create allowlists for approved workflow patterns',
          'Use Azure Policy to enforce workflow security requirements'
        ]
      },
      {
        id: 'execution-boundaries',
        name: 'Workflow Execution Boundaries',
        description: 'Define and enforce boundaries for workflow execution',
        impact: 'high',
        implementation: [
          'Use Azure RBAC to limit workflow permissions',
          'Implement resource limits for each workflow step',
          'Create time boundaries and timeouts for workflow execution'
        ]
      },
      {
        id: 'workflow-monitoring',
        name: 'Comprehensive Workflow Monitoring',
        description: 'Monitor workflow execution for security issues',
        impact: 'medium',
        implementation: [
          'Log all workflow execution details to Azure Monitor',
          'Implement real-time alerts for workflow anomalies',
          'Create visualization dashboards for workflow security status'
        ]
      }
    ],
    bestPractices: [
      {
        category: 'Workflow Security',
        practices: [
          'Implement approval gates for high-risk workflow steps',
          'Create workflow version control and change auditing',
          'Use Azure Logic Apps with managed identities for authentication',
          'Implement circuit breakers for unusual workflow patterns'
        ]
      },
      {
        category: 'Resource Management',
        practices: [
          'Create resource quotas for each workflow component',
          'Implement cost management and monitoring',
          'Use Azure Policy to enforce resource governance',
          'Create isolation between workflow environments'
        ]
      }
    ]
  }
];

interface PatternSecurityControlsProps {
  patternId: string;
  patternName: string;
}

const PatternSecurityControls: React.FC<PatternSecurityControlsProps> = ({ patternId, patternName }) => {
  // Find security configuration for the specified pattern
  const securityConfig = patternSecurityConfigurations.find(config => config.patternId === patternId);
  
  // If no configuration is found, provide a general message
  if (!securityConfig) {
    return (
      <div className="p-6 border rounded-lg bg-muted/10 text-center">
        <ShieldCheck size={32} className="text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Security Controls Not Specified</h3>
        <p className="text-muted-foreground">
          Specific security controls for the {patternName} pattern are not yet defined. 
          Please refer to the general security best practices in the Azure AI Services tab.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center p-4 rounded-lg bg-primary/5 border border-primary/30">
        <ShieldCheck size={24} className="text-primary mr-3" />
        <div>
          <h3 className="font-medium">Security Controls for {patternName}</h3>
          <p className="text-sm text-muted-foreground">
            Implement these security controls to mitigate risks specific to the {patternName} pattern.
          </p>
        </div>
      </div>
      
      {/* Key Vulnerabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Warning size={18} className="text-destructive" />
            Key Vulnerabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {securityConfig.keyVulnerabilities.map((vulnerability, index) => (
            <div key={index} className="p-3 border rounded-md bg-destructive/5">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  Risk
                </Badge>
                {vulnerability.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">{vulnerability.description}</p>
              <div className="mt-2 flex items-start gap-2">
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 mt-1">
                  Mitigation
                </Badge>
                <p className="text-sm">{vulnerability.mitigation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Security Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock size={18} className="text-primary" />
            Security Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {securityConfig.securityControls.map((control) => (
              <AccordionItem key={control.id} value={control.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${control.impact === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                          control.impact === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-muted/50 text-muted-foreground border-muted/20'}
                      `}
                    >
                      {control.impact === 'high' ? 'High Impact' : 
                       control.impact === 'medium' ? 'Medium Impact' : 
                       'Low Impact'}
                    </Badge>
                    <span>{control.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 space-y-4">
                    <p className="text-sm text-muted-foreground">{control.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Implementation Steps:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {control.implementation.map((step, idx) => (
                          <li key={idx} className="text-sm">{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle size={18} className="text-secondary" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {securityConfig.bestPractices.map((category, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-medium">{category.category}</h4>
              <ul className="list-disc pl-5 space-y-1">
                {category.practices.map((practice, idx) => (
                  <li key={idx} className="text-sm">{practice}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="p-4 border rounded-lg bg-muted/10">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Info size={16} className="text-primary" />
          Security Implementation Note
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          These security controls should be implemented based on your specific threat model and risk profile.
          For critical applications, consider engaging with security specialists to perform a comprehensive
          security assessment of your agent implementation.
        </p>
      </div>
    </div>
  );
};

export default PatternSecurityControls;