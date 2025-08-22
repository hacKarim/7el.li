'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Bell, DollarSign, ExternalLink, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  notifyOnPayment: boolean
  notifyOnLinkOpening: boolean
  notifyMarketing: boolean
}

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDialog({
  open,
  onOpenChange,
}: NotificationsDialogProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    notifyOnPayment: true,
    notifyOnLinkOpening: false,
    notifyMarketing: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [open])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSettingChange = (
    setting: keyof NotificationSettings,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Notification settings updated successfully')
        onOpenChange(false)
      } else {
        toast.error(data.error || 'Failed to update settings')
      }
    } catch (error) {
      toast.error('An error occurred while updating settings')
      console.error('Notifications settings error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CredenzaTitle>
          <CredenzaDescription>
            Choose which notifications you want to receive via email.
          </CredenzaDescription>
        </CredenzaHeader>

        {isFetching ? (
          <div className="py-8 text-center text-gray-500">
            Loading settings...
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Payment Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-sm">
                        Payment Notifications
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Get notified when someone purchases your content
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifyOnPayment}
                    onCheckedChange={(value) =>
                      handleSettingChange('notifyOnPayment', value)
                    }
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Link Opening Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-sm">
                        Link Opening Notifications
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Get notified when someone opens your shared links
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifyOnLinkOpening}
                    onCheckedChange={(value) =>
                      handleSettingChange('notifyOnLinkOpening', value)
                    }
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Marketing Emails */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <CardTitle className="text-sm">
                        Marketing Emails
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Receive updates about new features and promotions
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifyMarketing}
                    onCheckedChange={(value) =>
                      handleSettingChange('notifyMarketing', value)
                    }
                  />
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        <CredenzaFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isFetching}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
