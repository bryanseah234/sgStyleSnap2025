-- Performance indexes
CREATE INDEX idx_clothes_owner_id ON clothes(owner_id);
CREATE INDEX idx_clothes_removed_at ON clothes(removed_at);
CREATE INDEX idx_clothes_owner_privacy ON clothes(owner_id, privacy) WHERE removed_at IS NULL;

CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_requester_id ON friends(requester_id);
CREATE INDEX idx_friends_receiver_id ON friends(receiver_id);
CREATE INDEX idx_friends_requester_status ON friends(requester_id, status);
CREATE INDEX idx_friends_receiver_status ON friends(receiver_id, status);

CREATE INDEX idx_suggestions_to_user_id ON suggestions(to_user_id);

-- Function to check item quota
CREATE OR REPLACE FUNCTION check_item_quota(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*) FROM clothes 
    WHERE owner_id = user_id AND removed_at IS NULL;
$$ LANGUAGE sql;

-- Function to get friend's viewable items
CREATE OR REPLACE FUNCTION get_friend_closet(friend_id UUID, viewer_id UUID)
RETURNS SETOF clothes AS $$
    SELECT c.* FROM clothes c
    WHERE c.owner_id = friend_id
    AND c.removed_at IS NULL
    AND (
        c.privacy = 'friends' AND EXISTS (
            SELECT 1 FROM friends f
            WHERE ((f.requester_id = viewer_id AND f.receiver_id = friend_id) OR
                   (f.requester_id = friend_id AND f.receiver_id = viewer_id))
            AND f.status = 'accepted'
        )
    );
$$ LANGUAGE sql;