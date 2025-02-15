
"use client";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import styles from "./myaccount.module.css";
import { useFormik } from "formik";
import { updateSchema } from "../../../validation/schemas";
import { useRouter } from "next/navigation";
import { useUser } from "../../../hooks/UserContext";
import { toast } from "react-toastify";

interface FormValues {
  firstName: string;
  lastName: string;
  address: string;
}

export default function MyAccount() {
  const { user, setUser, fetchUserProfile } = useUser();
  const [isDeletePopupVisible, setDeletePopupVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: user?.user?.firstName || "",
      lastName: user?.user?.lastName || "",
      address: user?.user?.address || "",
    },
    enableReinitialize: true,
    validationSchema: updateSchema,
    onSubmit: async (values) => {
      try {
        const accessToken = Cookies.get("accessToken");
        const headers = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        };

        // Update Profile
        await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me/${user?.user?._id}`,
          values,
          headers
        );

        toast.success("Profile updated successfully!", {
          position: "bottom-right",
        });

        fetchUserProfile();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update profile. Please try again.", {
          position: "bottom-right",
        });
      }
    },
  });

  // Handle automatic file upload for avatar and logo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "logo") => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const accessToken = Cookies.get("accessToken");
      
      const uploadUrl = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me/${type}/${user?.user?._id}`;

      await axios.put(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`, {
        position: "bottom-right",
      });

      fetchUserProfile(); // Refresh user data
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update ${type}. Please try again.`, {
        position: "bottom-right",
      });
    }
  };


    const handleDelete = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      const deleteUrl = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me/${user?.user?._id}`;
      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      if (response.data?.status === "success") {
        Cookies.remove("accessToken");
        // Cookies.remove("refreshToken");
        // Cookies.remove("isLoggedin");
        router.push("/account/login");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.", {
        position: "bottom-right",
      });
    }
    setDeletePopupVisible(false);
  };

  return (
    <div className={styles.myaccountPage}>
      <div className={styles.myProfileContainer}>
        <div className={styles.profileCard}>
          <h2 className={styles.profileTitle}>My Profile</h2>
          <p className={styles.profileContent}>
            Manage your user account, including your contact and sign-in
            information.
          </p>
          {user ? (
            <>
              <div className={styles.profileDetails}>
                <p>Email: <span className={styles.profileEmail}>{user?.user?.email}</span></p>
              </div>
              <div className={styles.changeProfile}>
                <h2 className={styles.changeTitle}>Change Profile</h2>
                <form onSubmit={formik.handleSubmit}>
                  <div className={styles.inputGroup}>
                    <label>First Name:</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter your first name"
                      className={styles.input}
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <div className={styles.error}>{formik.errors.firstName}</div>
                    )}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last Name:</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter your last name"
                      className={styles.input}
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <div className={styles.error}>{formik.errors.lastName}</div>
                    )}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Address:</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter your address"
                      className={styles.input}
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.address && formik.errors.address && (
                      <div className={styles.error}>{formik.errors.address}</div>
                    )}
                  </div>

                  {/* Avatar Upload */}
                  <div className={styles.inputGroup}>
                    <label>Avatar:</label>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      className={styles.input}
                      onChange={(e) => handleFileUpload(e, "avatar")}
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className={styles.inputGroup}>
                    <label>Logo:</label>
                    <input
                      type="file"
                      name="logo"
                      className={styles.input}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "logo")}
                    />
                  </div>

                  <button type="submit" className={styles.saveButton} disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? "Saving..." : "Save"}
                  </button>
                </form>
              </div>

              <div className={styles.dangerCard}>
                <p className={styles.dangerTitle}>Danger Zone</p>
                <div className={styles.dangerbuttondiv}>
                  <button
                    className={styles.dangerButton}
                    onClick={() => setDeletePopupVisible(true)}
                  >
                    Close Account
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.loadingText}>Loading profile...</p>
          )}
        </div>

        {isDeletePopupVisible && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h3>Are you sure you want to delete your account?</h3>
              <div className={styles.popupButtons}>
                <button className={styles.confirmButton} onClick={() => {handleDelete()}}>
                  Confirm
                </button>
                <button className={styles.cancelButton} onClick={() => setDeletePopupVisible(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
