"use client";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import styles from "./myaccount.module.css";
import { useFormik } from "formik";
import { updateSchema } from "../../../validation/schemas";
import { useRouter } from "next/navigation";
import { useUser } from "../../../hooks/UserContext";
import {toast} from "react-hot-toast"
import { Label } from "../../../components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiUpload, FiTrash2, FiUser, FiHome, FiCamera } from "react-icons/fi";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; 

interface FormValues {
  firstName: string;
  lastName: string;
  address: string;
}

export default function MyAccount() {
  const { user, setUser, fetchUserProfile } = useUser();
  const [isDeletePopupVisible, setDeletePopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {   
    const fetchData = async () => {
      setIsLoading(true);  // Set loading before fetching data
      await fetchUserProfile();
      setIsLoading(false); // Set loading to false after fetching
    };
    
    fetchData();
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

        await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me/${user?.user?._id}`,
          values,
          headers
        );

        toast.success("Profile updated successfully!");
        fetchUserProfile();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update profile. Please try again.");
      }
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "logo") => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const accessToken = Cookies.get("accessToken");
      
      const uploadUrl = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me/${type}/${user?.user?._id}`;

      await axios.put(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      //  setIsUploading(false)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
      fetchUserProfile();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update ${type}. Please try again.`);
    }finally{
      setIsUploading(false);
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
        router.push("/account/login");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
    setDeletePopupVisible(false);
  };

   if (isLoading) {
      return <Spinner loading={isLoading} color="gray" />;
    }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <h1>Account Settings</h1>
        <p className={styles.profileSubtitle}>Manage your profile and account preferences</p>
      </div>

      <div className={styles.profileSection}>
        <div className={styles.profileMainSection}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {/* <img 
              src={user?.user?.avatar || "/default-avatar.png"} 
              alt="Avatar" 
              className={styles.avatar}
            /> */}
            <Image src={user?.user?.avatar || "/default.avif"} alt="Avatar" width={50} height={50} className={styles.avatar} />
            <label className={styles.avatarUpload}>
             {isUploading?   <AiOutlineLoading3Quarters size={20} className="animate-spin text-blue-500" />: <FiCamera size={20} />}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "avatar")}
                className={styles.hiddenInput}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className={styles.avatarInfo}>
            <h2>{user?.user?.firstName} {user?.user?.lastName}</h2>
            <p className={styles.userEmail}>{user?.user?.email}</p>
          </div>
          </div>
          <div className={styles.logoWrapper}>
            {user?.user?.logo ?<Image src = {user?.user?.logo  ||"/default.avif"} alt="Avatar" width={150} height={100} className={styles.logo}/> : ""}
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className={styles.formSection}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <Label><FiUser className={styles.inputIcon} /> First Name</Label>
              <Input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={formik.touched.firstName && !!formik.errors.firstName}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <span className={styles.error}>{formik.errors.firstName}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Label><FiUser className={styles.inputIcon} /> Last Name</Label>
              <Input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={formik.touched.lastName && !!formik.errors.lastName}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <span className={styles.error}>{formik.errors.lastName}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Label><FiHome className={styles.inputIcon} /> Address</Label>
              <Input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={formik.touched.address && !!formik.errors.address}
              />
              {formik.touched.address && formik.errors.address && (
                <span className={styles.error}>{formik.errors.address}</span>
              )}
            </div>
          </div>

          <div className={styles.fileUploadSection}>
            <Label>Company Logo</Label>
            <label className={styles.fileUploadLabel}>
            {isUploading ?(
            <>
            <AiOutlineLoading3Quarters size={20} className="animate-spin text-blue-500" />
            <span>Uploading...</span>
            </>)
              :(
              <>
              <FiUpload className={styles.uploadIcon} />
              <span>Click to upload logo</span>
              </>)}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "logo")}
                className={styles.hiddenInput}
                disabled={isUploading}
              />
            </label>
          </div>
       {/* in future fix disable instead of isLoding ,change button color  */}
          <div className={styles.buttonGroup}>
            <Button type="submit" variant="default" isLoading={formik.isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>

        <div className={styles.dangerZone}>
          <h3 className={styles.dangerZoneTitle}>Danger Zone</h3>
          <div className={styles.dangerZoneContent}>
            <p>Permanently delete your account and all associated data.</p>
            <Button 
              variant="destructive" 
              onClick={() => setDeletePopupVisible(true)}
              
            >
              <FiTrash2 />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {isDeletePopupVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <FiTrash2 size={32} className={styles.modalIcon} />
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setDeletePopupVisible(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}