import React, { useEffect, useState } from 'react';
import { shiftService } from '../services/shiftService';
import { ShiftApplication, ApplicationStatus } from '../types';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ShiftApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await shiftService.getPendingApplications();
      setApplications(data);
    } catch (err: any) {
      setError('Fehler beim Laden der Bewerbungen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    applicationId: string,
    status: ApplicationStatus,
    reviewNotes?: string
  ) => {
    try {
      await shiftService.reviewApplication(applicationId, {
        status,
        reviewNotes,
      });
      // Remove from list after review
      setApplications(apps => apps.filter(app => app.id !== applicationId));
    } catch (err: any) {
      setError('Fehler beim Überprüfen der Bewerbung');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bewerbungen</h1>
        <p className="text-gray-600 mt-1">
          Offene Bewerbungen prüfen und genehmigen
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine offenen Bewerbungen
          </h3>
          <p className="text-gray-600">
            Alle Bewerbungen wurden bereits bearbeitet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicationCard: React.FC<{
  application: ShiftApplication;
  onReview: (id: string, status: ApplicationStatus, notes?: string) => void;
}> = ({ application, onReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const priorityStars = '⭐'.repeat(application.priority);
  const shift = application.shift;
  const user = application.user;

  const handleApprove = () => {
    onReview(application.id, ApplicationStatus.APPROVED, reviewNotes || undefined);
  };

  const handleReject = () => {
    onReview(application.id, ApplicationStatus.REJECTED, reviewNotes || undefined);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-lg text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <span className="text-sm" title={`Priorität ${application.priority}`}>
              {priorityStars}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(application.appliedAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {shift && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900">{shift.positionName}</h4>
          <p className="text-sm text-gray-600 mt-1">{shift.event?.name}</p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span>
              📅{' '}
              {new Date(shift.shiftDate).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            <span>
              ⏰ {shift.startTime} - {shift.endTime}
            </span>
            {shift.hourlyRate && (
              <span className="text-green-600 font-medium">
                {shift.hourlyRate}€/h
              </span>
            )}
          </div>
        </div>
      )}

      {application.notes && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm">
            <span className="font-medium text-blue-900">💬 Nachricht: </span>
            <span className="text-blue-800">{application.notes}</span>
          </p>
        </div>
      )}

      {!showReviewForm ? (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setReviewNotes('');
              handleReject();
            }}
            className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium"
          >
            Ablehnen
          </button>
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Mit Notiz
          </button>
          <button
            onClick={() => {
              setReviewNotes('Genehmigt!');
              handleApprove();
            }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Genehmigen ✅
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Notiz zur Entscheidung (optional)..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-3">
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Abbrechen
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Ablehnen
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Genehmigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
