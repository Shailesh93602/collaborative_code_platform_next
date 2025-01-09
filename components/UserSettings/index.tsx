'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/useToast';
import { updateUserProfile } from '@/lib/api';
import TwoFactorAuth from '@/components/TwoFactorAuth/index';
import { validateAndSanitizeInput } from '@/lib/inputValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { settingsSchema } from './validations';
import { UserSettingsProps } from './types';

type SettingsFormValues = yup.InferType<typeof settingsSchema>;

export function UserSettings({ user }: UserSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<SettingsFormValues>({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio,
      githubProfile: user.profile.githubProfile,
      twitterHandle: user.profile.twitterHandle,
      websiteUrl: user.profile.websiteUrl,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const validatedData = await validateAndSanitizeInput(settingsSchema, data);
      await updateUserProfile(user.id, validatedData);
      toast({
        title: 'Settings updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Profile</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitterHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter Handle</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TwoFactorAuth />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
