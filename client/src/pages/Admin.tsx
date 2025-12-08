import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { Redirect } from "wouter";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  const { data: pendingClaims, refetch: refetchClaims } = trpc.admin.getPendingClaims.useQuery();
  
  const approveClaim = trpc.admin.approveClaim.useMutation({
    onSuccess: () => {
      toast.success("Business claim approved!");
      refetchClaims();
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectClaim = trpc.admin.rejectClaim.useMutation({
    onSuccess: () => {
      toast.success("Business claim rejected");
      refetchClaims();
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const sendEmail = trpc.admin.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Email sent successfully!");
      setEmailTo("");
      setEmailSubject("");
      setEmailBody("");
    },
    onError: (error) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  });

  const handleSendEmail = () => {
    if (!emailTo || !emailSubject || !emailBody) {
      toast.error("Please fill in all email fields");
      return;
    }

    sendEmail.mutate({
      to: emailTo,
      subject: emailSubject,
      body: emailBody,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-purple-600 mt-2">Manage business verifications and send emails</p>
        </div>

        <Tabs defaultValue="claims" className="space-y-6">
          <TabsList className="bg-white border-purple-200">
            <TabsTrigger value="claims" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Pending Claims ({pendingClaims?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </TabsTrigger>
          </TabsList>

          {/* Business Claims Tab */}
          <TabsContent value="claims">
            <div className="space-y-4">
              {pendingClaims && pendingClaims.length === 0 && (
                <Card className="p-8 text-center bg-white">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">No pending claims</p>
                  <p className="text-sm text-gray-500 mt-2">All business verification requests have been processed</p>
                </Card>
              )}

              {pendingClaims?.map((claim) => (
                <Card key={claim.id} className="p-6 bg-white shadow-lg border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Submitted {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-purple-900 mb-2">
                        Location ID: {claim.locationId}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Business Owner:</span>
                          <p className="font-semibold">{claim.userName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-semibold">{claim.userEmail}</p>
                        </div>
                      </div>

                      {claim.notes && (
                        <div className="bg-purple-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Notes:</span> {claim.notes}
                          </p>
                        </div>
                      )}

                      {claim.verificationDocumentUrl && (
                        <div className="mb-4">
                          <a
                            href={claim.verificationDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 underline text-sm"
                          >
                            View Verification Document →
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => approveClaim.mutate({ claimId: claim.id })}
                        disabled={approveClaim.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectClaim.mutate({ claimId: claim.id })}
                        disabled={rejectClaim.isPending}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card className="p-6 bg-white shadow-lg border-purple-200">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Send Free Email
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Send emails to users, business owners, or anyone else for free.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To (Email Address)
                    </label>
                    <Input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="recipient@example.com"
                      className="border-purple-300 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      className="border-purple-300 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type your message here..."
                      rows={8}
                      className="border-purple-300 focus:border-purple-500 resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSendEmail}
                    disabled={sendEmail.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendEmail.isPending ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
