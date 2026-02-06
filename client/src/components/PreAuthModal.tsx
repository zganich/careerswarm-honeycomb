import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Shield, Clock, Sparkles, Target, FileText } from "lucide-react";

interface PreAuthModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function PreAuthModal({ open, onClose, onContinue }: PreAuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Create Your Free Account
          </DialogTitle>
          <DialogDescription className="text-lg text-slate-600">
            Build your Master Profile once, then apply to jobs in 5 minutes
            instead of 4 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* What You'll Do */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              What you'll do (5 minutes total):
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Upload your resume (AI extracts achievements)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Review AI-extracted Master Profile</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Set job preferences (roles, industries, locations)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Start applying to matched opportunities</span>
              </li>
            </ul>
          </div>

          {/* What CareerSwarm Does */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              What CareerSwarm does for every application:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-slate-700">
                <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Finds best-fit jobs</strong> matching your profile
                  (Scout Agent)
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Tailors resume</strong> for each specific job (Tailor
                  Agent)
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Writes cover letters & outreach</strong> personalized
                  to company (Scribe Agent)
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Finds hiring managers</strong> and decision makers
                  (Hunter Agent)
                </span>
              </li>
            </ul>
          </div>

          {/* Time Savings Highlight */}
          <div className="bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-lg border-2 border-orange-200">
            <p className="text-center text-lg font-semibold text-slate-900">
              ⏱️ Saves <span className="text-orange-600">3.5 hours</span> per
              application
            </p>
            <p className="text-center text-sm text-slate-600 mt-1">
              For 100 applications: <strong>350 hours saved</strong> (8.75 work
              weeks)
            </p>
          </div>

          {/* Security Note */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 mb-1">
                  Secure OAuth Login
                </p>
                <p className="text-sm text-slate-600">
                  You'll be securely signed in with your email (takes 30
                  seconds). We never see your password and you can sign out
                  anytime.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={onContinue}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 shadow-lg"
              size="lg"
            >
              Continue to Secure Login
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Free account • No credit card required • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
