package runtime

const (
	FREQ_THREASHOLD = 5000
)

type Channel struct {
	Frequenz    uint32
	AllowedInEU bool
	DFS         bool
	Indoor      bool
	SDR         bool
}

var (
	ChannelEU   = true
	ChannelList = map[uint32]*Channel{
		1:   &Channel{Frequenz: 2412, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		2:   &Channel{Frequenz: 2417, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		3:   &Channel{Frequenz: 2422, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		4:   &Channel{Frequenz: 2427, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		5:   &Channel{Frequenz: 2432, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		6:   &Channel{Frequenz: 2437, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		7:   &Channel{Frequenz: 2442, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		8:   &Channel{Frequenz: 2447, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		9:   &Channel{Frequenz: 2452, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		10:  &Channel{Frequenz: 2457, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		11:  &Channel{Frequenz: 2462, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		12:  &Channel{Frequenz: 2467, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		13:  &Channel{Frequenz: 2472, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		14:  &Channel{Frequenz: 2484, AllowedInEU: false, DFS: false, Indoor: false, SDR: false},
		32:  &Channel{Frequenz: 5160, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		34:  &Channel{Frequenz: 5170, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		36:  &Channel{Frequenz: 5180, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		38:  &Channel{Frequenz: 5190, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		40:  &Channel{Frequenz: 5200, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		42:  &Channel{Frequenz: 5210, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		44:  &Channel{Frequenz: 5220, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		46:  &Channel{Frequenz: 5230, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		48:  &Channel{Frequenz: 5240, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		50:  &Channel{Frequenz: 5250, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		52:  &Channel{Frequenz: 5260, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		54:  &Channel{Frequenz: 5270, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		56:  &Channel{Frequenz: 5280, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		58:  &Channel{Frequenz: 5290, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		60:  &Channel{Frequenz: 5300, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		62:  &Channel{Frequenz: 5310, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		64:  &Channel{Frequenz: 5320, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		68:  &Channel{Frequenz: 5340, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		96:  &Channel{Frequenz: 5480, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		100: &Channel{Frequenz: 5500, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		102: &Channel{Frequenz: 5510, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		104: &Channel{Frequenz: 5520, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		106: &Channel{Frequenz: 5530, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		108: &Channel{Frequenz: 5540, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		110: &Channel{Frequenz: 5550, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		112: &Channel{Frequenz: 5560, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		114: &Channel{Frequenz: 5570, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		116: &Channel{Frequenz: 5580, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		118: &Channel{Frequenz: 5590, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		120: &Channel{Frequenz: 5600, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		122: &Channel{Frequenz: 5610, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		124: &Channel{Frequenz: 5620, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		126: &Channel{Frequenz: 5630, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		128: &Channel{Frequenz: 5640, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		132: &Channel{Frequenz: 5660, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		134: &Channel{Frequenz: 5670, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		136: &Channel{Frequenz: 5680, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		138: &Channel{Frequenz: 5690, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		140: &Channel{Frequenz: 5700, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		142: &Channel{Frequenz: 5710, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		144: &Channel{Frequenz: 5720, AllowedInEU: true, DFS: true, Indoor: false, SDR: true},
		149: &Channel{Frequenz: 5745, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		151: &Channel{Frequenz: 5755, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		153: &Channel{Frequenz: 5765, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		155: &Channel{Frequenz: 5775, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		157: &Channel{Frequenz: 5785, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		159: &Channel{Frequenz: 5795, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		161: &Channel{Frequenz: 5805, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		165: &Channel{Frequenz: 5825, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		169: &Channel{Frequenz: 5845, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		173: &Channel{Frequenz: 5865, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
	}
)

func ChannelIs5GHz(channel uint32) bool {
	fre, ok := ChannelList[channel]
	return ok && fre.Frequenz < FREQ_THREASHOLD
}

func GetChannel(channel uint32) *Channel {
	if ch, ok := ChannelList[channel]; ok {
		if !ChannelEU {
			return ch
		}
		if ch.AllowedInEU {
			return ch
		}
	}
	return nil
}
