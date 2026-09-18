import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  MessageSquareText,
  XCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type {
  CvAnalysisResult,
  InterviewQuestionCategory
} from "~/api/cv-analysis.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { MatchScore } from "./MatchScore";

const QUESTION_CATEGORIES: InterviewQuestionCategory[] = [
  "technical",
  "experience",
  "behavioral",
  "gap_probe"
];

function BulletList({
  items,
  icon: Icon,
  iconClassName,
  emptyLabel
}: {
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  emptyLabel: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm">
          <Icon className={`mt-0.5 size-4 shrink-0 ${iconClassName}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AnalysisResult({ result }: { result: CvAnalysisResult }) {
  const { t } = useTranslation();
  const { candidateProfile: profile } = result;

  const profileEntries = [
    [t("cvAnalysis.result.profile.name"), profile.name],
    [t("cvAnalysis.result.profile.title"), profile.currentTitle],
    [
      t("cvAnalysis.result.profile.experience"),
      profile.yearsOfExperience !== null
        ? t("cvAnalysis.result.profile.years", { count: profile.yearsOfExperience })
        : null
    ],
    [t("cvAnalysis.result.profile.location"), profile.location]
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const questionsByCategory = QUESTION_CATEGORIES.map((category) => ({
    category,
    questions: result.interviewQuestions.filter(
      (question) => question.category === category
    )
  })).filter((group) => group.questions.length > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.summary")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 md:flex-row md:items-start">
          <MatchScore score={result.matchScore} verdict={result.verdict} />
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.profile.heading")}</CardTitle>
        </CardHeader>
        <CardContent>
          {profileEntries.length ? (
            <dl className="space-y-2 text-sm">
              {profileEntries.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("cvAnalysis.result.profile.empty")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.skills.heading")}</CardTitle>
          <CardDescription>{t("cvAnalysis.result.skills.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("cvAnalysis.result.skills.matched", {
                count: result.matchedSkills.length
              })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.matchedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  {skill}
                </Badge>
              ))}
              {!result.matchedSkills.length && (
                <span className="text-sm text-muted-foreground">
                  {t("cvAnalysis.result.none")}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("cvAnalysis.result.skills.missing", {
                count: result.missingSkills.length
              })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.missingSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                >
                  {skill}
                </Badge>
              ))}
              {!result.missingSkills.length && (
                <span className="text-sm text-muted-foreground">
                  {t("cvAnalysis.result.none")}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.strengths")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BulletList
            items={result.strengths}
            icon={CheckCircle2}
            iconClassName="text-emerald-600 dark:text-emerald-400"
            emptyLabel={t("cvAnalysis.result.none")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.gaps")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BulletList
            items={result.gaps}
            icon={XCircle}
            iconClassName="text-rose-600 dark:text-rose-400"
            emptyLabel={t("cvAnalysis.result.none")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.redFlags")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BulletList
            items={result.redFlags}
            icon={AlertTriangle}
            iconClassName="text-amber-600 dark:text-amber-400"
            emptyLabel={t("cvAnalysis.result.noRedFlags")}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{t("cvAnalysis.result.feedback.heading")}</CardTitle>
          <CardDescription>{t("cvAnalysis.result.feedback.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BulletList
            items={result.feedbackForCandidate}
            icon={Lightbulb}
            iconClassName="text-sky-600 dark:text-sky-400"
            emptyLabel={t("cvAnalysis.result.none")}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="size-5" />
            {t("cvAnalysis.result.questions.heading", {
              count: result.interviewQuestions.length
            })}
          </CardTitle>
          <CardDescription>
            {t("cvAnalysis.result.questions.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            type="multiple"
            defaultValue={questionsByCategory.map((group) => group.category)}
          >
            {questionsByCategory.map((group) => (
              <AccordionItem key={group.category} value={group.category}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    {t(`cvAnalysis.result.questions.categories.${group.category}`)}
                    <Badge variant="secondary">{group.questions.length}</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="space-y-4">
                    {group.questions.map((question, index) => (
                      <li key={index} className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-sm font-medium">{question.question}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {question.rationale}
                        </p>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
