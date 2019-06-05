package runtime

const (
	FREQ_THREASHOLD = 5000
)

type Channel struct {
	Frequency   uint32
	AllowedInEU bool
	DFS         bool
	Indoor      bool
	SDR         bool
}

var (
	ChannelEU = true

	ChannelList = map[uint32]*Channel{
		1:   {Frequency: 2412, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		2:   {Frequency: 2417, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		3:   {Frequency: 2422, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		4:   {Frequency: 2427, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		5:   {Frequency: 2432, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		6:   {Frequency: 2437, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		7:   {Frequency: 2442, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		8:   {Frequency: 2447, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		9:   {Frequency: 2452, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		10:  {Frequency: 2457, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		11:  {Frequency: 2462, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		12:  {Frequency: 2467, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		13:  {Frequency: 2472, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		14:  {Frequency: 2484, AllowedInEU: false, DFS: false, Indoor: false, SDR: false},
		32:  {Frequency: 5160, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		34:  {Frequency: 5170, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		36:  {Frequency: 5180, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		38:  {Frequency: 5190, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		40:  {Frequency: 5200, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		42:  {Frequency: 5210, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		44:  {Frequency: 5220, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		46:  {Frequency: 5230, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		48:  {Frequency: 5240, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		50:  {Frequency: 5250, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		52:  {Frequency: 5260, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		54:  {Frequency: 5270, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		56:  {Frequency: 5280, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		58:  {Frequency: 5290, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		60:  {Frequency: 5300, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		62:  {Frequency: 5310, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		64:  {Frequency: 5320, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		68:  {Frequency: 5340, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		96:  {Frequency: 5480, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		100: {Frequency: 5500, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		102: {Frequency: 5510, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		104: {Frequency: 5520, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		106: {Frequency: 5530, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		108: {Frequency: 5540, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		110: {Frequency: 5550, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		112: {Frequency: 5560, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		114: {Frequency: 5570, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		116: {Frequency: 5580, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		118: {Frequency: 5590, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		120: {Frequency: 5600, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		122: {Frequency: 5610, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		124: {Frequency: 5620, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		126: {Frequency: 5630, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		128: {Frequency: 5640, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		132: {Frequency: 5660, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		134: {Frequency: 5670, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		136: {Frequency: 5680, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		138: {Frequency: 5690, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		140: {Frequency: 5700, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		142: {Frequency: 5710, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		144: {Frequency: 5720, AllowedInEU: true, DFS: true, Indoor: false, SDR: true},
		149: {Frequency: 5745, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		151: {Frequency: 5755, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		153: {Frequency: 5765, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		155: {Frequency: 5775, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		157: {Frequency: 5785, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		159: {Frequency: 5795, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		161: {Frequency: 5805, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		165: {Frequency: 5825, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		169: {Frequency: 5845, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		173: {Frequency: 5865, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
	}
)

func ChannelIs5GHz(channel uint32) bool {
	ch, ok := ChannelList[channel]
	return ok && (!ChannelEU || ch.AllowedInEU) && ch.Frequency > FREQ_THREASHOLD
}

func GetChannel(channel uint32) *Channel {
	if ch, ok := ChannelList[channel]; ok {
		if !ChannelEU || ch.AllowedInEU {
			return ch
		}
	}
	return nil
}
func GetChannelByFrequency(freq uint32) (uint32, *Channel) {
	for ch, channel := range ChannelList {
		if channel.Frequency == freq {
			return ch, channel
		}
	}
	return 0, nil
}
