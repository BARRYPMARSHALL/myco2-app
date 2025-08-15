import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { activityHelpers } from '../lib/supabase';

const PhotoVerificationModal = ({ 
  visible, 
  onClose, 
  activity, 
  user, 
  onPhotoVerified 
}) => {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      requestPermissions();
    }
  }, [visible]);

  const requestPermissions = async () => {
    try {
      // Request camera permission
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed for photo verification');
        return false;
      }

      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed for GPS verification');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
      return false;
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0]);
        
        // Automatically get location when photo is taken
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0]);
        
        // Get location when photo is selected
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Warning', 'Could not get location. Photo will be uploaded without GPS data.');
    } finally {
      setLocationLoading(false);
    }
  };

  const uploadPhotoAndVerify = async () => {
    if (!photo || !activity || !user) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setUploading(true);

    try {
      // Upload photo and create activity with verification
      const activityData = {
        user_id: user.id,
        activity_type_id: activity.id,
        quantity: 1,
        points_earned: activity.points_per_unit,
        co2_saved: activity.co2_saved_per_unit,
        notes: 'Photo verified activity',
        photo_uri: photo.uri,
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        } : null,
      };

      const { data, error } = await activityHelpers.logActivityWithPhoto(activityData);

      if (error) {
        Alert.alert('Error', 'Failed to upload photo and verify activity');
        console.error('Upload error:', error);
      } else {
        Alert.alert(
          'Activity Verified! 🎉',
          `Great job! You earned ${activity.points_per_unit} points and saved ${activity.co2_saved_per_unit}kg of CO2!`,
          [
            {
              text: 'Awesome!',
              onPress: () => {
                if (onPhotoVerified) {
                  onPhotoVerified(data);
                }
                handleClose();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to verify activity');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPhoto(null);
    setLocation(null);
    setUploading(false);
    setLocationLoading(false);
    onClose();
  };

  const getActivityInstructions = (activityName) => {
    switch (activityName) {
      case 'Walking/Biking':
        return 'Take a photo of yourself walking, biking, or at your destination';
      case 'Public Transit':
        return 'Take a photo of yourself on public transport or at a transit station';
      case 'Plant-Based Meals':
        return 'Take a photo of your delicious plant-based meal';
      case 'Recycling':
        return 'Take a photo of items you\'re recycling or at a recycling center';
      case 'Energy Saving':
        return 'Take a photo showing your energy-saving action (LED bulbs, unplugged devices, etc.)';
      default:
        return 'Take a photo to verify your eco-friendly activity';
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Photo Verification</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {activity && (
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.instructions}>
                {getActivityInstructions(activity.name)}
              </Text>
            </View>
          )}

          {!photo ? (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoButton} onPress={selectFromGallery}>
                <Text style={styles.photoButtonIcon}>🖼️</Text>
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              
              <View style={styles.photoInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <Text style={styles.infoText}>
                    {locationLoading ? 'Getting location...' :
                     location ? `Location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` :
                     'Location: Not available'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>⭐</Text>
                  <Text style={styles.infoText}>
                    You'll earn: {activity?.points_per_unit || 0} points
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🌱</Text>
                  <Text style={styles.infoText}>
                    CO2 saved: {activity?.co2_saved_per_unit || 0}kg
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.retakeButton} 
                  onPress={() => setPhoto(null)}
                >
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.verifyButton, uploading && styles.verifyButtonDisabled]}
                  onPress={uploadPhotoAndVerify}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify Activity</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.verificationInfo}>
            <Text style={styles.verificationTitle}>🔒 Verification Benefits</Text>
            <Text style={styles.verificationBenefit}>• 2x points for photo-verified activities</Text>
            <Text style={styles.verificationBenefit}>• GPS location adds authenticity</Text>
            <Text style={styles.verificationBenefit}>• Builds trust in the eco-community</Text>
            <Text style={styles.verificationBenefit}>• Unlocks special achievements</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 24,
    color: '#9ca3af',
    padding: 4,
  },
  activityInfo: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  photoActions: {
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  photoPreview: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  photoInfo: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#d1d5db',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retakeButton: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationInfo: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
  },
  verificationBenefit: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
});

export default PhotoVerificationModal;

