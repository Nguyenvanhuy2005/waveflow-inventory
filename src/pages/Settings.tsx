
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { testApiConnection, saveApiCredentials, getStockwaveSettings, ApiCredentials } from "@/services/settingsService";
import { Save, TestTube, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const queryClient = useQueryClient();
  const [wpUsername, setWpUsername] = useState("sithethao");
  const [wpPassword, setWpPassword] = useState("LDUe HXkt Le1k ZmJT tkmL OVHs");
  const [consumerKey, setConsumerKey] = useState("ck_7935a07888db15201ea09300934d277d69064c33");
  const [consumerSecret, setConsumerSecret] = useState("cs_27bd2111e8402f827a7261707125929171061a2d");
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string}>({});
  const [isCredentialsChanged, setIsCredentialsChanged] = useState(false);

  useEffect(() => {
    // Tải cấu hình API khi trang được tải
    const loadSettings = async () => {
      const result = await getStockwaveSettings();
      if (result.success && result.data) {
        setWpUsername(result.data.wpUsername || "sithethao");
        setWpPassword(result.data.wpPassword || "");
        setConsumerKey(result.data.consumerKey || "");
        setConsumerSecret(result.data.consumerSecret || "");
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    setIsCredentialsChanged(true);
  }, [wpUsername, wpPassword, consumerKey, consumerSecret]);

  const saveMutation = useMutation({
    mutationFn: (credentials: ApiCredentials) => saveApiCredentials(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Đã lưu thông tin đăng nhập thành công");
      setIsCredentialsChanged(false);
    },
    onError: () => {
      toast.error("Không thể lưu thông tin đăng nhập");
    },
  });

  const testMutation = useMutation({
    mutationFn: testApiConnection,
    onSuccess: (data) => {
      setTestResult({ success: data.success, message: data.message });
      if (data.success) {
        toast.success("Kết nối API thành công");
      } else {
        toast.error(`Kết nối API thất bại: ${data.message}`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Kết nối API thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      setTestResult({ 
        success: false, 
        message: `Kết nối API thất bại: ${errorMessage}` 
      });
      toast.error(`Kết nối API thất bại: ${errorMessage}`);
    },
  });

  const handleSave = async () => {
    const credentials = {
      wpUsername,
      wpPassword,
      consumerKey,
      consumerSecret,
    };
    saveMutation.mutate(credentials);
  };

  const handleTest = async () => {
    await handleSave();
    testMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Cài đặt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kết nối API</CardTitle>
          <CardDescription>
            Cài đặt thông tin để kết nối với WordPress và WooCommerce API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">WordPress REST API</h3>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Tên người dùng và mật khẩu ứng dụng</AlertTitle>
              <AlertDescription>
                Sử dụng tên đăng nhập WordPress (không phải tên ứng dụng) và mật khẩu ứng dụng (Application Password) để xác thực API.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wpUsername">Tên người dùng WordPress</Label>
                <Input
                  id="wpUsername"
                  value={wpUsername}
                  onChange={(e) => setWpUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wpPassword">Mật khẩu ứng dụng</Label>
                <Input
                  id="wpPassword"
                  type="password"
                  value={wpPassword}
                  onChange={(e) => setWpPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">WooCommerce REST API</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="consumerKey">Consumer Key</Label>
                <Input
                  id="consumerKey"
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumerSecret">Consumer Secret</Label>
                <Input
                  id="consumerSecret"
                  type="password"
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                />
              </div>
            </div>
          </div>

          {testResult.message && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {testResult.success ? "Kết nối thành công" : "Kết nối thất bại"}
              </AlertTitle>
              <AlertDescription>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saveMutation.isPending || !isCredentialsChanged}>
              {saveMutation.isPending ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cài đặt
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testMutation.isPending}>
              {testMutation.isPending ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Kiểm tra kết nối
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
          <CardDescription>
            Các thông tin về môi trường và cấu hình.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex justify-between border-b py-2">
              <span className="font-medium">Phiên bản</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium">WordPress URL</span>
              <span>https://hcm.sithethao.com</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium">WordPress API</span>
              <span>v2</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium">WooCommerce API</span>
              <span>v3</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
