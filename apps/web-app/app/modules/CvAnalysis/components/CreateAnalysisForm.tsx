import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useCreateCvAnalysis } from "~/api/mutations/useCreateCvAnalysis";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { UploadDropzone } from "./UploadDropzone";

const MIN_JOB_DESCRIPTION_LENGTH = 30;

export function CreateAnalysisForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createAnalysis = useCreateCvAnalysis();

  const [title, setTitle] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobMode, setJobMode] = useState<"text" | "file">("text");
  const [jobText, setJobText] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);

  const jobTextValid = jobText.trim().length >= MIN_JOB_DESCRIPTION_LENGTH;
  const jobProvided = jobMode === "text" ? jobTextValid : Boolean(jobFile);
  const canSubmit = Boolean(cvFile) && jobProvided && !createAnalysis.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cvFile) return;

    try {
      const analysis = await createAnalysis.mutateAsync({
        title,
        cv: cvFile,
        jobDescriptionFile: jobMode === "file" ? jobFile : null,
        jobDescriptionText: jobMode === "text" ? jobText : undefined
      });

      toast.success(t("cvAnalysis.form.toast.created"));
      void navigate(`/dashboard/cv-analyses/${analysis.id}`);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("cvAnalysis.form.cv.title")}</CardTitle>
          <CardDescription>{t("cvAnalysis.form.cv.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadDropzone
            file={cvFile}
            onFileChange={setCvFile}
            label={t("cvAnalysis.form.cv.dropzone")}
            disabled={createAnalysis.isPending}
          />
          <div className="space-y-2">
            <Label htmlFor="analysis-title">{t("cvAnalysis.form.title.label")}</Label>
            <Input
              id="analysis-title"
              value={title}
              maxLength={120}
              placeholder={t("cvAnalysis.form.title.placeholder")}
              disabled={createAnalysis.isPending}
              onChange={(event) => setTitle(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("cvAnalysis.form.title.hint")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("cvAnalysis.form.job.title")}</CardTitle>
          <CardDescription>{t("cvAnalysis.form.job.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={jobMode}
            onValueChange={(value) => setJobMode(value as "text" | "file")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="text">{t("cvAnalysis.form.job.tabs.text")}</TabsTrigger>
              <TabsTrigger value="file">{t("cvAnalysis.form.job.tabs.file")}</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-2">
              <Textarea
                value={jobText}
                rows={12}
                placeholder={t("cvAnalysis.form.job.placeholder")}
                disabled={createAnalysis.isPending}
                onChange={(event) => setJobText(event.target.value)}
                className="min-h-56 resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {jobTextValid
                  ? t("cvAnalysis.form.job.chars", { count: jobText.trim().length })
                  : t("cvAnalysis.form.job.minChars", {
                      min: MIN_JOB_DESCRIPTION_LENGTH
                    })}
              </p>
            </TabsContent>
            <TabsContent value="file">
              <UploadDropzone
                file={jobFile}
                onFileChange={setJobFile}
                label={t("cvAnalysis.form.job.dropzone")}
                disabled={createAnalysis.isPending}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start gap-3 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted-foreground">{t("cvAnalysis.form.footnote")}</p>
        <Button type="submit" size="lg" disabled={!canSubmit}>
          {createAnalysis.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {createAnalysis.isPending
            ? t("cvAnalysis.form.submitting")
            : t("cvAnalysis.form.submit")}
        </Button>
      </div>
    </form>
  );
}
