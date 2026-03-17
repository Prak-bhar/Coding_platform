import React, { useState, useEffect } from 'react';
import api from '../api';

export default function RatingManager({
  contest,
  participants,
  token,
  onUpdated,
}) {
  const [local, setLocal] = useState([]);
  const [saving, setSaving] = useState({});
  // Added message state to replace alerts
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setLocal(
      participants.map((p) => ({
        ...p,
        newRating: p.rating_after ?? p.rating_before,
      }))
    );
  }, [participants]);

  const handleChange = (userId, value) => {
    setLocal((l) =>
      l.map((p) =>
        p.user_id === userId ? { ...p, newRating: Number(value) } : p
      )
    );
  };

  const save = async (userId) => {
    const p = local.find((x) => x.user_id === userId);
    if (!p) return;

    if (p.rating_after !== null && typeof p.rating_after !== 'undefined') {
      // Use styled message instead of alert
      setMessage({
        text: 'Rating already set and cannot be changed',
        type: 'error',
      });
      return;
    }

    setSaving((s) => ({ ...s, [userId]: true }));
    setMessage({ text: '', type: '' }); // Clear message on save
    try {
      await api.updateParticipantRating(token, contest.id, userId, p.newRating);
      setMessage({ text: `Rating for ${p.user_name} saved.`, type: 'success' });
      if (onUpdated) await onUpdated();
    } catch (err) {
      // Use styled message instead of alert
      setMessage({
        text: err?.message || 'Failed to update rating',
        type: 'error',
      });
    } finally {
      setSaving((s) => ({ ...s, [userId]: false }));
    }
  };

  // Helper to render styled messages
  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mb-4 p-3 rounded-md ${
          isSuccess
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        } text-sm`}
      >
        {message.text}
      </div>
    );
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Rating Manager</h3>

      {renderMessage()}

      {/* Styled empty state */}
      {!participants || participants.length === 0 ? (
        <div className="muted text-center p-8">
          No participants in this contest yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Styled table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 font-semibold">Participant</th>
                <th className="py-2 px-2 font-semibold text-center">
                  Rating Before
                </th>
                <th className="py-2 px-2 font-semibold text-center">
                  Rating After
                </th>
                <th className="py-2 px-2 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {local.map((p) => (
                <tr
                  key={p.user_id}
                  className="border-b border-gray-100 hover:bg-sky-50"
                >
                  <td className="py-3 px-2 font-medium">{p.user_name}</td>
                  <td className="py-3 px-2 text-center muted">
                    {p.rating_before ?? '-'}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {p.rating_after !== null &&
                    typeof p.rating_after !== 'undefined' ? (
                      <span className="font-bold">{p.rating_after}</span>
                    ) : (
                      <input
                        type="number"
                        // Use form-input but make it smaller
                        className="form-input !p-2 w-24 text-center"
                        value={p.newRating}
                        onChange={(e) =>
                          handleChange(p.user_id, e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {p.rating_after !== null &&
                    typeof p.rating_after !== 'undefined' ? (
                      <button
                        className="btn btn-ghost !py-1 !px-3 opacity-60 cursor-not-allowed"
                        disabled
                      >
                        Locked
                      </button>
                    ) : (
                      <button
                        // Make button smaller
                        className={`btn btn-primary !py-1 !px-3 ${
                          saving[p.user_id] ? 'opacity-70 cursor-wait' : ''
                        }`}
                        onClick={() => save(p.user_id)}
                        disabled={saving[p.user_id]}
                      >
                        {saving[p.user_id] ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}