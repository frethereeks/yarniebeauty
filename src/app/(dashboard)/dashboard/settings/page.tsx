import { getDashboardUser, getNotificationPreferences } from "@/actions";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { NotificationPrefsForm } from "@/components/dashboard/notification-prefs-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";

export default async function SettingsPage() {
  const [user, prefs] = await Promise.all([getDashboardUser(), getNotificationPreferences()]);

  if (!user || !prefs) return null;

  const initials = `${user.firstname[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase();

  return (
    <div className="max-w-2xl">
      <h1 className="text-display-lg mb-10">Profile &amp; Settings</h1>

      <section className="mb-12">
        <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Photo</h2>
        <AvatarUpload initialUrl={user.image} initials={initials} />
      </section>

      <section className="mb-12">
        <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Profile details</h2>
        <ProfileForm
          initial={{
            firstname: user.firstname,
            lastname: user.lastname,
            phone: user.phone ?? "",
            defaultAddress: user.defaultAddress ?? "",
            defaultCity: user.defaultCity ?? "",
            defaultState: user.defaultState ?? "",
          }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Notifications</h2>
        <NotificationPrefsForm initial={prefs} />
      </section>

      {user.provider === "local" && (
        <section className="mb-12">
          <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Password</h2>
          <ChangePasswordForm />
        </section>
      )}
    </div>
  );
}
