# 👤 User Flows Documentation

## Overview
This document contains detailed user flow diagrams for all major features in StyleSnap, showing step-by-step user journeys and decision points.

---

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Closet Management Flow](#closet-management-flow)
3. [Outfit Generation Flow](#outfit-generation-flow)
4. [Social Features Flow](#social-features-flow)
5. [Notification Flow](#notification-flow)
6. [Catalog Browsing Flow](#catalog-browsing-flow)
7. [Friend Management Flow](#friend-management-flow)

---

## Authentication Flow

### Google OAuth Login
```mermaid
flowchart TD
    Start([User Opens App]) --> CheckAuth{Authenticated?}
    CheckAuth -->|Yes| Dashboard[Dashboard/Closet]
    CheckAuth -->|No| LoginPage[Login Page]
    
    LoginPage --> ClickGoogle[Click 'Sign in with Google']
    ClickGoogle --> GooglePopup[Google OAuth Popup]
    GooglePopup --> GoogleAuth{Google Auth}
    
    GoogleAuth -->|Success| CreateProfile{Profile Exists?}
    GoogleAuth -->|Cancelled| LoginPage
    GoogleAuth -->|Error| ShowError[Show Error Message]
    ShowError --> LoginPage
    
    CreateProfile -->|Yes| Dashboard
    CreateProfile -->|No| CreateUser[Create User Record]
    CreateUser --> SelectAvatar[Select Avatar]
    SelectAvatar --> Dashboard
    
    Dashboard --> End([App Ready])
```

**Key Decision Points:**
- Is user already authenticated?
- Does user profile exist in database?
- Did Google authentication succeed?

**Error Handling:**
- Failed auth: Show error, return to login
- Network error: Show retry option
- Invalid token: Clear session, force re-login

---

## Closet Management Flow

### Adding New Item
```mermaid
flowchart TD
    Start([User in Closet]) --> CheckQuota{Under 50 items?}
    
    CheckQuota -->|Yes| ClickAdd[Click + FAB]
    CheckQuota -->|No| ShowQuotaModal[Show Quota Limit Modal]
    ShowQuotaModal --> ChooseAction{User Choice}
    ChooseAction -->|Delete Old Item| DeleteFlow[Go to Delete Flow]
    ChooseAction -->|Browse Catalog| CatalogFlow[Go to Catalog]
    ChooseAction -->|Cancel| End([Stay in Closet])
    
    ClickAdd --> UploadModal[Add Item Modal]
    UploadModal --> ChooseSource{Source?}
    
    ChooseSource -->|Upload| FileSelect[Select File]
    ChooseSource -->|Camera| CameraCapture[Capture Photo]
    ChooseSource -->|Cancel| End
    
    FileSelect --> ValidateFile{Valid Image?}
    CameraCapture --> ValidateFile
    
    ValidateFile -->|No| ShowError[Show Error: Invalid Format]
    ShowError --> UploadModal
    ValidateFile -->|Yes| CompressImage[Compress Image]
    
    CompressImage --> UploadCloud[Upload to Cloudinary]
    UploadCloud --> UploadStatus{Upload Success?}
    
    UploadStatus -->|No| ShowUploadError[Show Upload Error]
    ShowUploadError --> Retry{Retry?}
    Retry -->|Yes| UploadCloud
    Retry -->|No| End
    
    UploadStatus -->|Yes| FillDetails[Fill Item Details]
    FillDetails --> EnterName[Enter Name]
    EnterName --> SelectCategory[Select Category]
    SelectCategory --> OptionalDetails[Optional: Size, Brand, Tags]
    OptionalDetails --> SelectPrivacy[Select Privacy: Private/Friends]
    SelectPrivacy --> ClickSave[Click Save]
    
    ClickSave --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidationError[Show Validation Errors]
    ShowValidationError --> FillDetails
    
    ValidateForm -->|Yes| SaveToDB[Save to Database]
    SaveToDB --> SaveStatus{Save Success?}
    
    SaveStatus -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> ClickSave
    
    SaveStatus -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> RefreshCloset[Refresh Closet Grid]
    RefreshCloset --> End
    
    DeleteFlow --> End
    CatalogFlow --> End
```

### Deleting Item (Soft Delete)
```mermaid
flowchart TD
    Start([User in Closet]) --> SelectItem[Click Item Card]
    SelectItem --> ItemDetail[Item Detail Modal]
    ItemDetail --> ClickDelete[Click Delete Button]
    
    ClickDelete --> ConfirmModal[Show Confirmation Modal]
    ConfirmModal --> Confirm{Confirm Delete?}
    
    Confirm -->|No| ItemDetail
    Confirm -->|Yes| SoftDelete[Set removed_at = now()]
    
    SoftDelete --> UpdateQuota[Decrement Quota Count]
    UpdateQuota --> RemoveFromGrid[Remove from Grid]
    RemoveFromGrid --> ShowUndo[Show Undo Toast]
    ShowUndo --> UndoTimer{User Clicks Undo?}
    
    UndoTimer -->|Yes, within 5s| RestoreItem[Set removed_at = NULL]
    RestoreItem -->|Success| ReAddToGrid[Re-add to Grid]
    ReAddToGrid --> End([Item Restored])
    
    UndoTimer -->|No, after 5s| ItemDeleted[Item Soft Deleted]
    ItemDeleted --> RecoveryPeriod[30-day Recovery Period]
    RecoveryPeriod --> End
```

---

## Outfit Generation Flow

### Auto-Generate Outfits
```mermaid
flowchart TD
    Start([User in Suggestions]) --> CheckItems{Has 3+ items?}
    
    CheckItems -->|No| ShowEmpty[Show Empty State]
    ShowEmpty --> AddItemsPrompt[Prompt: Add Items]
    AddItemsPrompt --> End([Go to Closet])
    
    CheckItems -->|Yes| ShowFilters[Show Context Filters]
    ShowFilters --> SelectWeather[Select Weather]
    SelectWeather --> SelectOccasion[Select Occasion]
    SelectOccasion --> SelectStyle[Optional: Select Style]
    SelectStyle --> ClickGenerate[Click Generate]
    
    ClickGenerate --> ShowLoading[Show Loading Spinner]
    ShowLoading --> FetchItems[Fetch User's Items]
    FetchItems --> GroupByCategory[Group by Category]
    
    GroupByCategory --> ValidateGroups{Has Top+Bottom+Shoes?}
    ValidateGroups -->|No| ShowError[Show Error: Missing Items]
    ShowError --> End
    
    ValidateGroups -->|Yes| GeneratePerms[Generate Permutations]
    GeneratePerms --> LimitPerms[Limit to 200 combos]
    LimitPerms --> ScoreOutfits[Score Each Outfit]
    ScoreOutfits --> FilterContext[Filter by Context]
    FilterContext --> SortByScore[Sort by Score DESC]
    SortByScore --> TakeTop10[Take Top 10]
    
    TakeTop10 --> DisplayOutfits[Display Outfit Cards]
    DisplayOutfits --> UserAction{User Action?}
    
    UserAction -->|View Details| ShowDetail[Show Outfit Detail]
    ShowDetail --> SaveOption{Save Outfit?}
    
    SaveOption -->|Yes| SaveOutfit[Save to My Outfits]
    SaveOutfit --> ShowSaveSuccess[Show Success Toast]
    ShowSaveSuccess --> DisplayOutfits
    
    SaveOption -->|No| DisplayOutfits
    
    UserAction -->|Regenerate| ShowFilters
    UserAction -->|Share| ShareModal[Open Share Modal]
    ShareModal --> SelectVisibility[Select Visibility]
    SelectVisibility --> AddCaption[Add Caption]
    AddCaption --> ShareOutfit[Share to Feed]
    ShareOutfit --> End
    
    UserAction -->|Exit| End
```

### Manual Outfit Creation
```mermaid
flowchart TD
    Start([User in Outfits]) --> ClickCreate[Click 'Create Outfit']
    ClickCreate --> OpenCreator[Open Manual Creator]
    
    OpenCreator --> Split[Split View: Sidebar + Canvas]
    Split --> BrowseItems[Browse Items in Sidebar]
    BrowseItems --> FilterItems[Optional: Filter/Search]
    FilterItems --> DragItem[Drag Item to Canvas]
    
    DragItem --> DropCanvas[Drop on Canvas]
    DropCanvas --> PositionItem[Position Item]
    PositionItem --> MoreItems{Add More Items?}
    
    MoreItems -->|Yes| BrowseItems
    MoreItems -->|No| ReviewOutfit[Review Outfit]
    
    ReviewOutfit --> Satisfied{Satisfied?}
    Satisfied -->|No| EditCanvas{Edit Type?}
    
    EditCanvas -->|Remove Item| RemoveFromCanvas[Remove Item]
    RemoveFromCanvas --> ReviewOutfit
    
    EditCanvas -->|Reposition| DragReposition[Drag to New Position]
    DragReposition --> ReviewOutfit
    
    EditCanvas -->|Add More| BrowseItems
    
    Satisfied -->|Yes| ClickSave[Click Save]
    ClickSave --> SaveDialog[Show Save Dialog]
    SaveDialog --> EnterCaption[Enter Caption]
    EnterCaption --> SelectVisibility[Select Visibility]
    SelectVisibility --> ConfirmSave[Click Confirm]
    
    ConfirmSave --> SaveToDB[Save to Database]
    SaveToDB --> SaveSuccess{Success?}
    
    SaveSuccess -->|No| ShowError[Show Error]
    ShowError --> SaveDialog
    
    SaveSuccess -->|Yes| CloseCreator[Close Creator]
    CloseCreator --> ShowInList[Show in Outfit List]
    ShowInList --> End([Outfit Saved])
```

---

## Social Features Flow

### Viewing Friends Feed
```mermaid
flowchart TD
    Start([User Clicks Feed]) --> LoadFeed[Load Friends Feed]
    LoadFeed --> ShowLoading[Show Loading Skeleton]
    ShowLoading --> FetchFeed[Call get_friends_outfit_feed()]
    
    FetchFeed --> CheckFriends{Has Friends?}
    CheckFriends -->|No| ShowEmpty[Empty State: Find Friends]
    ShowEmpty --> GoToFriends[Link to Friends Page]
    GoToFriends --> End([In Friends Page])
    
    CheckFriends -->|Yes| CheckOutfits{Friends Have Outfits?}
    CheckOutfits -->|No| ShowEmptyFeed[Empty State: No Outfits Yet]
    ShowEmptyFeed --> End([Wait for Friends])
    
    CheckOutfits -->|Yes| DisplayFeed[Display Outfit Cards]
    DisplayFeed --> UserAction{User Action?}
    
    UserAction -->|Like| ToggleLike[Toggle Like]
    ToggleLike --> UpdateUI[Update Like Count]
    UpdateUI --> NotifyFriend[Create Notification]
    NotifyFriend --> DisplayFeed
    
    UserAction -->|Comment| OpenComments[Open Comments Modal]
    OpenComments --> WriteComment[Write Comment]
    WriteComment --> PostComment[Post Comment]
    PostComment --> UpdateComments[Update Comment Count]
    UpdateComments --> NotifyOwner[Notify Outfit Owner]
    NotifyOwner --> DisplayFeed
    
    UserAction -->|View Profile| GoToProfile[Go to Friend Profile]
    GoToProfile --> End
    
    UserAction -->|Load More| LoadMore[Load Next Page]
    LoadMore --> FetchMore[Fetch with Offset]
    FetchMore --> AppendFeed[Append to Feed]
    AppendFeed --> DisplayFeed
    
    UserAction -->|Refresh| LoadFeed
    UserAction -->|Exit| End
```

### Sending Friend Request
```mermaid
flowchart TD
    Start([User in Friends]) --> SearchUser[Search for User]
    SearchUser --> EnterQuery[Enter Username/Email]
    EnterQuery --> ClickSearch[Click Search]
    
    ClickSearch --> ShowResults[Display Search Results]
    ShowResults --> SelectUser[Click User Card]
    SelectUser --> ViewProfile[View Profile]
    
    ViewProfile --> CheckStatus{Friend Status?}
    
    CheckStatus -->|Already Friends| ShowOptions[Show: Message, View Closet]
    CheckStatus -->|Pending Sent| ShowPending[Show: Request Pending]
    CheckStatus -->|Pending Received| ShowAccept[Show: Accept/Reject]
    CheckStatus -->|Not Friends| ShowAddButton[Show: Add Friend Button]
    
    ShowAddButton --> ClickAdd[Click Add Friend]
    ClickAdd --> CreateRequest[Create Friend Request]
    CreateRequest --> InsertDB[Insert into friends table]
    InsertDB --> NotifyUser[Create Notification]
    NotifyUser --> UpdateUI[Update Button: Pending]
    UpdateUI --> End([Request Sent])
    
    ShowAccept --> ClickAccept{User Action?}
    ClickAccept -->|Accept| UpdateStatus[Set status = 'accepted']
    UpdateStatus --> NotifyRequester[Notify Requester]
    NotifyRequester --> ShowFriends[Show in Friends List]
    ShowFriends --> End
    
    ClickAccept -->|Reject| SetRejected[Set status = 'rejected']
    SetRejected --> RemoveRequest[Remove from Requests]
    RemoveRequest --> End
    
    ShowOptions --> End
    ShowPending --> End
```

---

## Notification Flow

### Real-Time Notification System
```mermaid
flowchart TD
    Start([App Initialized]) --> InitStore[Initialize Notifications Store]
    InitStore --> GetUser[Get Current User]
    GetUser --> Subscribe[Subscribe to Real-Time]
    
    Subscribe --> WebSocket[Establish WebSocket Connection]
    WebSocket --> ListenChannel[Listen: notifications table]
    ListenChannel --> FetchInitial[Fetch Initial Notifications]
    FetchInitial --> UpdateBadge[Update Badge Count]
    UpdateBadge --> Ready[System Ready]
    
    Ready --> WaitEvent{Wait for Event}
    
    WaitEvent -->|New Notification| ReceiveNotif[Receive via WebSocket]
    ReceiveNotif --> ParseType{Notification Type?}
    
    ParseType -->|Friend Suggestion| FormatSuggestion[Format: Friend suggested outfit]
    ParseType -->|Outfit Like| FormatLike[Format: Friend liked outfit]
    ParseType -->|Item Like| FormatItemLike[Format: Friend liked item]
    ParseType -->|Friend Request| FormatRequest[Format: Friend request]
    
    FormatSuggestion --> AddToStore[Add to Store]
    FormatLike --> AddToStore
    FormatItemLike --> AddToStore
    FormatRequest --> AddToStore
    
    AddToStore --> IncrementBadge[Increment Badge Count]
    IncrementBadge --> ShowBadge[Show Badge with Number]
    ShowBadge --> PulseBadge[Pulse Animation]
    PulseBadge --> BrowserNotif{Enabled?}
    
    BrowserNotif -->|Yes| ShowBrowser[Show Browser Notification]
    ShowBrowser --> WaitEvent
    BrowserNotif -->|No| WaitEvent
    
    WaitEvent -->|User Clicks Bell| OpenPage[Open Notifications Page]
    OpenPage --> DisplayList[Display Notification List]
    DisplayList --> UserAction{User Action?}
    
    UserAction -->|Click Notification| MarkRead[Mark as Read]
    MarkRead --> RouteAction{Action Type?}
    
    RouteAction -->|Suggestion| OpenApproval[Open Approval Modal]
    OpenApproval --> ApproveReject{User Choice?}
    
    ApproveReject -->|Approve| ApproveSuggestion[Call approve RPC]
    ApproveSuggestion --> CreateOutfit[Create Outfit from Items]
    CreateOutfit --> ShowSuccess[Show Success]
    ShowSuccess --> RemoveNotif[Remove Notification]
    RemoveNotif --> DisplayList
    
    ApproveReject -->|Reject| RejectSuggestion[Call reject RPC]
    RejectSuggestion --> RemoveNotif
    
    RouteAction -->|Like| GoToOutfit[Go to Outfit Detail]
    GoToOutfit --> End([View Outfit])
    
    RouteAction -->|Friend Request| GoToProfile[Go to User Profile]
    GoToProfile --> End
    
    UserAction -->|Mark All Read| MarkAllRead[Call mark_all_read RPC]
    MarkAllRead --> ClearBadge[Clear Badge]
    ClearBadge --> RefreshList[Refresh List]
    RefreshList --> DisplayList
    
    UserAction -->|Switch Tab| FilterList[Filter: All/Unread]
    FilterList --> DisplayList
    
    UserAction -->|Exit| End([Close Notifications])
```

---

## Catalog Browsing Flow

### Browse and Add from Catalog
```mermaid
flowchart TD
    Start([User in Catalog]) --> LoadCatalog[Load Catalog Items]
    LoadCatalog --> DisplayGrid[Display Item Grid]
    
    DisplayGrid --> UserAction{User Action?}
    
    UserAction -->|Filter Category| SelectCategory[Select Category Filter]
    SelectCategory --> ApplyFilter[Apply Filter]
    ApplyFilter --> RefreshGrid[Refresh Grid]
    RefreshGrid --> DisplayGrid
    
    UserAction -->|Search| EnterSearch[Enter Search Query]
    EnterSearch --> ClickSearch[Click Search]
    ClickSearch --> SearchDB[Search Database]
    SearchDB --> DisplayResults[Display Results]
    DisplayResults --> DisplayGrid
    
    UserAction -->|Click Item| ViewDetail[View Item Detail]
    ViewDetail --> ShowModal[Show Detail Modal]
    ShowModal --> CheckQuota{Under 50 items?}
    
    CheckQuota -->|No| ShowQuotaError[Show Quota Error]
    ShowQuotaError --> CloseModal[Close Modal]
    CloseModal --> DisplayGrid
    
    CheckQuota -->|Yes| ShowAddButton[Show 'Add to Closet']
    ShowAddButton --> ClickAdd[Click Add]
    ClickAdd --> CopyItem[Copy Item Data]
    CopyItem --> AssignOwner[Assign to User]
    AssignOwner --> InsertCloset[Insert into clothes table]
    
    InsertCloset --> InsertSuccess{Success?}
    InsertSuccess -->|No| ShowError[Show Error]
    ShowError --> ShowModal
    
    InsertSuccess -->|Yes| IncrementQuota[Increment Quota]
    IncrementQuota --> ShowSuccess[Show Success Toast]
    ShowSuccess --> UpdateButton[Update Button: Added ✓]
    UpdateButton --> CloseModal
    
    UserAction -->|Load More| LoadNextPage[Load Next Page]
    LoadNextPage --> AppendGrid[Append to Grid]
    AppendGrid --> DisplayGrid
    
    UserAction -->|Exit| End([Leave Catalog])
```

---

## Friend Management Flow

### Managing Friend Relationships
```mermaid
flowchart TD
    Start([User in Friends]) --> LoadFriends[Load Friends List]
    LoadFriends --> DisplayTabs[Display Tabs: Friends/Requests]
    
    DisplayTabs --> SelectTab{Tab Selected?}
    
    SelectTab -->|Friends Tab| LoadAccepted[Load Accepted Friends]
    LoadAccepted --> DisplayFriendsList[Display Friends List]
    DisplayFriendsList --> FriendAction{User Action?}
    
    FriendAction -->|View Profile| OpenProfile[Open Friend Profile]
    OpenProfile --> End([In Profile])
    
    FriendAction -->|Message| OpenChat[Open Chat]
    OpenChat --> End
    
    FriendAction -->|View Closet| ViewCloset[View Friend's Closet]
    ViewCloset --> BrowseItems[Browse Shared Items]
    BrowseItems --> SuggestOutfit{Suggest Outfit?}
    
    SuggestOutfit -->|Yes| SelectItems[Select Items]
    SelectItems --> AddMessage[Add Message]
    AddMessage --> SendSuggestion[Create Suggestion]
    SendSuggestion --> NotifyFriend[Notify Friend]
    NotifyFriend --> End
    
    SuggestOutfit -->|No| End
    
    FriendAction -->|Unfriend| ConfirmUnfriend[Confirm Unfriend]
    ConfirmUnfriend --> Confirm{Confirmed?}
    Confirm -->|No| DisplayFriendsList
    Confirm -->|Yes| DeleteFriendship[Delete from friends table]
    DeleteFriendship --> RemoveFromList[Remove from List]
    RemoveFromList --> HideFeedItems[Hide Their Feed Items]
    HideFeedItems --> DisplayFriendsList
    
    SelectTab -->|Requests Tab| LoadRequests[Load Pending Requests]
    LoadRequests --> DisplayRequestsList[Display Requests List]
    DisplayRequestsList --> RequestAction{User Action?}
    
    RequestAction -->|Accept| AcceptRequest[Update status = 'accepted']
    AcceptRequest --> NotifyRequester[Notify Requester]
    NotifyRequester --> MoveToFriends[Move to Friends Tab]
    MoveToFriends --> DisplayRequestsList
    
    RequestAction -->|Reject| RejectRequest[Update status = 'rejected']
    RejectRequest --> RemoveFromRequests[Remove from List]
    RemoveFromRequests --> DisplayRequestsList
    
    RequestAction -->|View Profile| OpenProfile
    
    DisplayFriendsList --> End
    DisplayRequestsList --> End
```

---

## Key Interactions Summary

### Cross-Feature Flows

**1. Notification → Action Flow**
```
Notification Received 
  → Click Bell Icon 
  → View Notification 
  → Click Notification Item 
  → Route to Feature (Outfit/Profile/Suggestion) 
  → Perform Action
```

**2. Social Share Flow**
```
Generate Outfit 
  → Save Outfit 
  → Click Share 
  → Select Visibility 
  → Add Caption 
  → Post to Feed 
  → Friends See in Feed
```

**3. Friend Suggestion Flow**
```
View Friend's Closet 
  → Select Items 
  → Create Suggestion 
  → Friend Gets Notification 
  → Friend Approves 
  → Outfit Added to Friend's Closet
```

---

## Error Handling Flows

### Network Error Recovery
```mermaid
flowchart TD
    Start([Network Request]) --> MakeRequest[Send API Request]
    MakeRequest --> CheckStatus{Request Status?}
    
    CheckStatus -->|Success 200| ProcessData[Process Response]
    ProcessData --> End([Success])
    
    CheckStatus -->|Error 4xx| ClientError[Client Error]
    ClientError --> ShowUserError[Show Error to User]
    ShowUserError --> End
    
    CheckStatus -->|Error 5xx| ServerError[Server Error]
    ServerError --> Retry{Retry Count < 3?}
    Retry -->|Yes| WaitBackoff[Wait with Exponential Backoff]
    WaitBackoff --> MakeRequest
    Retry -->|No| ShowRetryOption[Show Manual Retry Option]
    ShowRetryOption --> End
    
    CheckStatus -->|Network Error| NetworkFail[Network Failure]
    NetworkFail --> CheckOnline{Is Online?}
    CheckOnline -->|No| ShowOffline[Show Offline Banner]
    ShowOffline --> WaitOnline[Wait for Connection]
    WaitOnline --> MakeRequest
    CheckOnline -->|Yes| Retry
```

---

## Related Documentation
- [API Reference](./API_REFERENCE.md) - API endpoints
- [Architecture](./ARCHITECTURE.md) - System architecture
- [Database Guide](../DATABASE_GUIDE.md) - Complete database structure and setup
- [Notifications](./NOTIFICATIONS.md) - Notification system

---

## Status: COMPLETE ✅
All major user flows documented with detailed diagrams!
