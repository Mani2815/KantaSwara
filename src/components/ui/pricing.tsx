"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils/cn";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Starter",
    description: "Small businesses beginning their AI Voice Automation journey.",
    price: 9999,
    yearlyPrice: 7999,
    setupFee: "₹25,000 One-Time Setup",
    buttonText: "Start Your AI Journey",
    secondaryButtonText: "Request a Demo",
    buttonVariant: "outline" as const,
    popular: false,
    includes: [
      "Includes:",
      "1 AI Voice Agent",
      "500 Voice Minutes / Month",
      "Knowledge Document Retrieval",
      "Live Operations Dashboard",
      "Sales Team Call Handoff",
    ],
  },
  {
    name: "Growth",
    description: "Growing organizations requiring multiple AI Voice Agents and advanced automation.",
    price: 24999,
    yearlyPrice: 19999,
    setupFee: "₹50,000 One-Time Setup",
    buttonText: "Get Started",
    secondaryButtonText: "Talk to Sales",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Everything in Starter, plus:",
      "Up to 3 AI Voice Agents",
      "2,500 Voice Minutes / Month",
      "Bi-directional CRM Sync",
      "Automated Appointment Booking",
      "Advanced Intent Classification",
    ],
  },
  {
    name: "Enterprise",
    description: "Large enterprises requiring fully customized AI Voice solutions.",
    price: "Custom",
    yearlyPrice: "Custom",
    setupFee: "",
    buttonText: "Contact Sales",
    secondaryButtonText: "Schedule Consultation",
    buttonVariant: "outline" as const,
    popular: false,
    includes: [
      "Everything in Growth, plus:",
      "Unlimited AI Agents & Minutes",
      "Custom Workflow Development",
      "Custom ERP/System Integrations",
      "Dedicated Secure Infrastructure",
      "Enterprise SLA & Support",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-50 border border-gray-200 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0  h-12 w-full rounded-full border-4 shadow-sm shadow-orange-600 border-orange-600 bg-gradient-to-t from-orange-500 via-orange-400 to-orange-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0  h-12 w-full rounded-full border-4 shadow-sm shadow-orange-600 border-orange-600 bg-gradient-to-t from-orange-500 via-orange-400 to-orange-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-black">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection5() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      id="pricing"
      className="px-4 pt-28 pb-16 min-h-screen max-w-6xl mx-auto relative scroll-mt-0 flex flex-col justify-start"
      ref={pricingRef}
    >
      <article className="text-center mb-8 space-y-2 w-full mx-auto flex flex-col items-center">
        <h2 className="md:text-[48px] text-4xl font-[800] leading-[1.1] tracking-tight text-gray-900">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Flexible Pricing for Every Business
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef as React.RefObject<any>}
          customVariants={revealVariants}
          className="text-lg text-gray-600 w-full mx-auto leading-loose"
        >
          Choose a plan that fits your organization&apos;s AI Voice Automation needs.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef as React.RefObject<any>}
          customVariants={revealVariants}
          className=""
        >
          <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit" />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 gap-3 py-4">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef as React.RefObject<any>}
            customVariants={revealVariants}
          >
            <Card
              className={`relative border border-neutral-200 h-full flex flex-col ${plan.popular
                ? "ring-2 ring-orange-500 bg-orange-50"
                : "bg-white "
                }`}
            >
              <CardHeader className="text-left p-4 pb-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold tracking-tight text-gray-900 mb-0.5">
                    {plan.name} Plan
                  </h3>
                  {plan.popular && (
                    <div className="">
                      <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2 leading-snug min-h-[32px]">
                  {plan.description}
                </p>
                <div className="flex flex-col mt-1 mb-2">
                  <div className="flex items-baseline">
                    {plan.price === "Custom" ? (
                      <span className="text-3xl font-bold tracking-tight text-gray-900">
                        Contact Sales
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
                          <span className="text-2xl mr-1">₹</span>
                          <NumberFlow
                            format={{
                              useGrouping: true,
                            }}
                            value={isYearly ? (plan.yearlyPrice as number) : (plan.price as number)}
                            className="text-3xl font-bold tracking-tight"
                          />
                        </span>
                        <span className="text-gray-500 ml-1 text-xs font-medium">
                          /month
                        </span>
                      </>
                    )}
                  </div>
                  {plan.price !== "Custom" && (
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">
                      + {plan.setupFee}
                    </span>
                  )}
                  {plan.price === "Custom" && (
                    <span className="text-[10px] text-transparent font-medium uppercase tracking-wider mt-1 select-none">
                      spacer
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                <button
                  className={`w-full mb-2 py-2 text-sm font-bold rounded-full transition-transform active:scale-95 ${plan.popular
                    ? "bg-gradient-to-t from-orange-500 to-orange-600 shadow-md shadow-orange-500/20 border border-orange-400 text-white"
                    : plan.buttonVariant === "outline"
                      ? "bg-gradient-to-t from-neutral-900 to-neutral-600 shadow-md shadow-neutral-900/20 border border-neutral-700 text-white"
                      : ""
                    }`}
                >
                  {plan.buttonText}
                </button>
                <button
                  className={`w-full mb-3 py-2 text-sm font-semibold rounded-full bg-white text-black border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors`}
                >
                  {plan.secondaryButtonText}
                </button>

                <div className="space-y-1.5 pt-3 border-t border-neutral-200 mt-auto">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                    Features
                  </h2>
                  <h4 className="font-semibold text-xs text-gray-900 mb-1.5">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-1 font-medium">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="h-4 w-4 shrink-0 bg-white border border-orange-500 rounded-full flex items-center justify-center mt-0.5 mr-2">
                          <CheckCheck className="h-2.5 w-2.5 text-orange-500" />
                        </span>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
      <div className="mt-4">
        <TimelineContent as="div" animationNum={7} timelineRef={pricingRef as React.RefObject<any>} customVariants={revealVariants}>
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Implementation fees are charged once per AI Voice Agent project. Monthly subscriptions begin after successful deployment. Additional usage and custom integrations may incur extra charges.
          </p>
        </TimelineContent>
      </div>
    </div>
  );
}
